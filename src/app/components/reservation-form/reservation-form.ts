import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnDestroy,
  effect,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Subscription } from 'rxjs';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal';
import { CountdownComponent } from '../countdown/countdown';
import { ReservationResponse } from '../../types/reservation';
import { environment } from '../../../environment/environment';
import {
  TRANSPORTATION_TYPE,
  RESERVATION_FORM_FIELDS,
  DIGITAL_TEAMS,
} from './models/reservation.const';
import { FileUpload } from './models/file-upload.interface';
import {
  ACCEPTED_TYPES,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
} from './models/reservation-form.const';
import {
  numbersOnlyValidator,
  outsourceEmployeeValidator,
} from './models/reservation-form.validators';

@Component({
  selector: 'app-reservation-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ConfirmationModalComponent,
    CountdownComponent,
    MatButtonToggleModule,
  ],
  templateUrl: './reservation-form.html',
  styleUrl: './reservation-form.css',
})
export class ReservationFormComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private subscriptions = new Subscription();
  private readonly API_URL = `${environment.apiUrl}/reservations`;

  public TRANSPORTATION_TYPE = TRANSPORTATION_TYPE;
  public RESERVATION_FORM_FIELDS = RESERVATION_FORM_FIELDS;
  public DIGITAL_TEAMS = DIGITAL_TEAMS;

  // National ID mode state signal
  nationalIdMode = signal<'single' | 'double'>('single');

  // Roommate national ID modes (tracks mode for each roommate)
  roommateNationalIdModes = signal<('single' | 'double')[]>(['single']);

  // Roommate staff IDs (tracks staff ID for each roommate)
  roommatestuffid = signal<string[]>(['']);
  form = this.fb.group(
    {
      [RESERVATION_FORM_FIELDS.STAFF_ID]: [
        '',
        [Validators.required, numbersOnlyValidator, outsourceEmployeeValidator],
      ],
      [RESERVATION_FORM_FIELDS.NAME]: ['', [Validators.required]],
      [RESERVATION_FORM_FIELDS.DIGITAL_TEAM]: ['', [Validators.required]],
      [RESERVATION_FORM_FIELDS.TRANSPORTATION_TYPE]: [TRANSPORTATION_TYPE.BUS as string],
      [RESERVATION_FORM_FIELDS.WANT_SINGLE_ROOM]: [false],
      [RESERVATION_FORM_FIELDS.ROOMMATE_STAFF_ID]: this.fb.array([this.fb.control('')]),
      busReservation: this.fb.array([], [Validators.required]),
      nationalIds: this.fb.array([], [Validators.required]),
      roommateNationalIds: this.fb.array([]),
      [RESERVATION_FORM_FIELDS.NOTE]: [''],
    },
    // { validators: this.createSubmitValidator() },
  );
  constructor() {
    this.setupTransportationTypeListener();
  }
  // File uploads as signals
  busFile = signal<FileUpload>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    downloadURL: null,
    error: null,
  });

  singleRoomFile = signal<FileUpload>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    downloadURL: null,
    error: null,
  });

  nationalIdFile = signal<FileUpload>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    downloadURL: null,
    error: null,
  });

  nationalIdFrontFile = signal<FileUpload>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    downloadURL: null,
    error: null,
  });

  nationalIdBackFile = signal<FileUpload>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    downloadURL: null,
    error: null,
  });

  // Roommate national ID files (up to 2 roommates - supports both single and double modes)
  roommateNationalIdFiles = signal<
    {
      single: FileUpload;
      double: { front: FileUpload; back: FileUpload };
    }[]
  >([
    {
      single: {
        file: null,
        preview: null,
        uploading: false,
        progress: 0,
        downloadURL: null,
        error: null,
      },
      double: {
        front: {
          file: null,
          preview: null,
          uploading: false,
          progress: 0,
          downloadURL: null,
          error: null,
        },
        back: {
          file: null,
          preview: null,
          uploading: false,
          progress: 0,
          downloadURL: null,
          error: null,
        },
      },
    },
  ]);

  // UI state signals
  showModal = signal(false);
  isSubmitting = signal(false);
  submitted = signal(false);
  referenceId = signal<string | null>(null);
  submitError = signal<string | null>(null);
  notesExpanded = signal(false);

  private setupTransportationTypeListener(): void {
    const transportationTypeControl = this.form.get(RESERVATION_FORM_FIELDS.TRANSPORTATION_TYPE);
    const busReservationArray = this.form.get('busReservation') as FormArray;

    if (transportationTypeControl) {
      this.subscriptions.add(
        transportationTypeControl.valueChanges.subscribe((value) => {
          if (value === TRANSPORTATION_TYPE.BUS) {
            busReservationArray.setValidators([Validators.required]);
          } else {
            busReservationArray.clearValidators();
            busReservationArray.clear();
          }
          busReservationArray.updateValueAndValidity();
        }),
      );
    }
  }

  private createSubmitValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      // Check single room file if single room is requested
      if (
        group.get(RESERVATION_FORM_FIELDS.WANT_SINGLE_ROOM)?.value &&
        !this.singleRoomFile().file
      ) {
        return { missingSingleRoomFile: true };
      }

      // Check national IDs FormArray
      const nationalIdsArray = group.get('nationalIds') as FormArray;
      if (!nationalIdsArray || nationalIdsArray.length === 0) {
        return { missingNationalIds: true };
      }

      return null;
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.revokePreviewUrls();
  }

  private revokePreviewUrls(): void {
    [
      this.busFile(),
      this.singleRoomFile(),
      this.nationalIdFile(),
      this.nationalIdFrontFile(),
      this.nationalIdBackFile(),
    ].forEach((f) => {
      if (f.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(f.preview);
      }
    });

    // Revoke roommate preview URLs
    this.roommateNationalIdFiles().forEach((roommate) => {
      [roommate.single, roommate.double.front, roommate.double.back].forEach((f) => {
        if (f.preview?.startsWith('blob:')) {
          URL.revokeObjectURL(f.preview);
        }
      });
    });
  }

  // ─────────────────────────────────────────
  // FILE HANDLING
  // ─────────────────────────────────────────

  private validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Invalid file type. Accepted: JPG, JPEG, PNG, PDF.';
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`;
    }
    return null;
  }

  private buildPreview(file: File): string | null {
    return file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
  }

  onFileSelected(
    event: Event,
    target:
      | 'bus'
      | 'singleRoom'
      | 'nationalId'
      | 'nationalIdFront'
      | 'nationalIdBack'
      | 'roommateNationalId',
    roommateIndex?: number,
    roommateFileType?: 'single' | 'front' | 'back',
  ): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (target === 'roommateNationalId' && roommateIndex !== undefined && roommateFileType) {
        this.processRoommateFile(roommateIndex, roommateFileType, file);
      } else {
        this.processFile(target as Exclude<typeof target, 'roommateNationalId'>, file);
      }
    }
    input.value = '';
  }

  private processFile(
    target: 'bus' | 'singleRoom' | 'nationalId' | 'nationalIdFront' | 'nationalIdBack',
    file: File,
  ): void {
    const error = this.validateFile(file);
    if (error) {
      this.updateFileState(target, { error } as Partial<FileUpload>);
      return;
    }

    const preview = this.buildPreview(file);
    this.updateFileState(target, {
      file,
      preview,
      error: null,
      uploading: false,
      progress: 0,
      downloadURL: null,
    });
  }

  removeFile(
    target:
      | 'bus'
      | 'singleRoom'
      | 'nationalId'
      | 'nationalIdFront'
      | 'nationalIdBack'
      | 'roommateNationalId',
    roommateIndex?: number,
    roommateFileType?: 'single' | 'front' | 'back',
  ): void {
    if (target === 'roommateNationalId' && roommateIndex !== undefined && roommateFileType) {
      this.removeRoommateFileInternal(roommateIndex, roommateFileType);
      return;
    }

    const current = this.getFileSignal(target as Exclude<typeof target, 'roommateNationalId'>)();
    if (current.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(current.preview);
    }
    this.getFileSignal(target as Exclude<typeof target, 'roommateNationalId'>).set({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      downloadURL: null,
      error: null,
    });

    // Update FormArrays when files change
    if (target === 'bus') {
      this.updateBusReservationFormArray();
    } else if (target.startsWith('nationalId')) {
      this.updateNationalIdsFormArray();
    }
  }

  private getFileSignal(
    target: 'bus' | 'singleRoom' | 'nationalId' | 'nationalIdFront' | 'nationalIdBack',
  ) {
    const map = {
      bus: this.busFile,
      singleRoom: this.singleRoomFile,
      nationalId: this.nationalIdFile,
      nationalIdFront: this.nationalIdFrontFile,
      nationalIdBack: this.nationalIdBackFile,
    };
    return map[target];
  }

  private updateFileState(
    target: 'bus' | 'singleRoom' | 'nationalId' | 'nationalIdFront' | 'nationalIdBack',
    updates: Partial<FileUpload>,
  ): void {
    this.getFileSignal(target).update((current) => ({ ...current, ...updates }));

    // Update FormArrays when files change
    if (target === 'bus') {
      this.updateBusReservationFormArray();
    } else if (target.startsWith('nationalId')) {
      this.updateNationalIdsFormArray();
    }
  }

  private processRoommateFile(
    index: number,
    fileType: 'single' | 'front' | 'back',
    file: File,
  ): void {
    const error = this.validateFile(file);
    const preview = this.buildPreview(file);

    this.roommateNationalIdFiles.update((current) => {
      const updated = [...current];
      if (fileType === 'single') {
        updated[index] = {
          ...updated[index],
          single: {
            file: error ? null : file,
            preview: error ? null : preview,
            error: error || null,
            uploading: false,
            progress: 0,
            downloadURL: null,
          },
        };
      } else if (fileType === 'front') {
        updated[index] = {
          ...updated[index],
          double: {
            ...updated[index].double,
            front: {
              file: error ? null : file,
              preview: error ? null : preview,
              error: error || null,
              uploading: false,
              progress: 0,
              downloadURL: null,
            },
          },
        };
      } else if (fileType === 'back') {
        updated[index] = {
          ...updated[index],
          double: {
            ...updated[index].double,
            back: {
              file: error ? null : file,
              preview: error ? null : preview,
              error: error || null,
              uploading: false,
              progress: 0,
              downloadURL: null,
            },
          },
        };
      }
      return updated;
    });

    this.updateRoommateNationalIdsFormArray();
  }

  private removeRoommateFileInternal(index: number, fileType: 'single' | 'front' | 'back'): void {
    this.roommateNationalIdFiles.update((current) => {
      const updated = [...current];
      if (fileType === 'single') {
        if (updated[index].single.preview?.startsWith('blob:')) {
          URL.revokeObjectURL(updated[index].single.preview!);
        }
        updated[index] = {
          ...updated[index],
          single: {
            file: null,
            preview: null,
            uploading: false,
            progress: 0,
            downloadURL: null,
            error: null,
          },
        };
      } else if (fileType === 'front') {
        if (updated[index].double.front.preview?.startsWith('blob:')) {
          URL.revokeObjectURL(updated[index].double.front.preview!);
        }
        updated[index] = {
          ...updated[index],
          double: {
            ...updated[index].double,
            front: {
              file: null,
              preview: null,
              uploading: false,
              progress: 0,
              downloadURL: null,
              error: null,
            },
          },
        };
      } else if (fileType === 'back') {
        if (updated[index].double.back.preview?.startsWith('blob:')) {
          URL.revokeObjectURL(updated[index].double.back.preview!);
        }
        updated[index] = {
          ...updated[index],
          double: {
            ...updated[index].double,
            back: {
              file: null,
              preview: null,
              uploading: false,
              progress: 0,
              downloadURL: null,
              error: null,
            },
          },
        };
      }
      return updated;
    });

    this.updateRoommateNationalIdsFormArray();
  }

  private updateNationalIdsFormArray(): void {
    const nationalIdsArray = this.form.get('nationalIds') as FormArray;
    const count = this.getNationalIdFileCount();

    // Clear and rebuild the array based on current file count
    while (nationalIdsArray.length > 0) {
      nationalIdsArray.removeAt(0);
    }

    // Add a control for each uploaded national ID file
    for (let i = 0; i < count; i++) {
      nationalIdsArray.push(this.fb.control({ value: `nationalId_${i}`, disabled: false }));
    }
  }

  private updateBusReservationFormArray(): void {
    const busReservationArray = this.form.get('busReservation') as FormArray;
    const transportationType = this.form.get(RESERVATION_FORM_FIELDS.TRANSPORTATION_TYPE)?.value;

    // Only update if transportation type is BUS
    if (transportationType !== TRANSPORTATION_TYPE.BUS) {
      return;
    }

    // Clear and rebuild the array based on file status
    while (busReservationArray.length > 0) {
      busReservationArray.removeAt(0);
    }

    // Add a control if bus file is uploaded
    if (this.busFile().file) {
      busReservationArray.push(this.fb.control({ value: 'busReservation_0', disabled: false }));
    }
  }

  private getNationalIdFileCount(): number {
    if (this.nationalIdMode() === 'single') {
      return this.nationalIdFile().file ? 1 : 0;
    } else {
      let count = 0;
      if (this.nationalIdFrontFile().file) count++;
      if (this.nationalIdBackFile().file) count++;
      return count;
    }
  }

  changeNationalIdMode(mode: 'single' | 'double'): void {
    this.nationalIdMode.set(mode);
    this.updateNationalIdsFormArray();
  }

  changeRoommateNationalIdMode(roommateIndex: number, mode: 'single' | 'double'): void {
    this.roommateNationalIdModes.update((modes) => {
      const updated = [...modes];
      updated[roommateIndex] = mode;
      return updated;
    });
  }

  private updateRoommateNationalIdsFormArray(): void {
    const roommateNationalIdsArray = this.form.get('roommateNationalIds') as FormArray;
    let totalUploadedCount = 0;

    // Count uploaded files based on each roommate's mode
    this.roommateNationalIdFiles().forEach((roommate, index) => {
      const mode = this.roommateNationalIdModes()[index];
      if (mode === 'single' && roommate.single.file) {
        totalUploadedCount++;
      } else if (mode === 'double') {
        if (roommate.double.front.file) totalUploadedCount++;
        if (roommate.double.back.file) totalUploadedCount++;
      }
    });

    // Clear and rebuild the array based on uploaded files
    while (roommateNationalIdsArray.length > 0) {
      roommateNationalIdsArray.removeAt(0);
    }

    // Add a control for each uploaded file
    for (let i = 0; i < totalUploadedCount; i++) {
      roommateNationalIdsArray.push(
        this.fb.control({ value: `roommateNationalId_${i}`, disabled: false }),
      );
    }
  }

  addRoommate(): void {
    const current = this.roommateNationalIdFiles();
    if (current.length < 2) {
      this.roommateNationalIdFiles.set([
        ...current,
        {
          single: {
            file: null,
            preview: null,
            uploading: false,
            progress: 0,
            downloadURL: null,
            error: null,
          },
          double: {
            front: {
              file: null,
              preview: null,
              uploading: false,
              progress: 0,
              downloadURL: null,
              error: null,
            },
            back: {
              file: null,
              preview: null,
              uploading: false,
              progress: 0,
              downloadURL: null,
              error: null,
            },
          },
        },
      ]);
      // Add corresponding mode for the new roommate
      this.roommateNationalIdModes.update((modes) => [...modes, 'single']);
    }
  }

  removeRoommate(index: number): void {
    this.roommateNationalIdFiles.update((current) => {
      const updated = [...current];
      const roommate = updated[index];
      // Revoke preview URLs for single and double modes
      if (roommate.single.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(roommate.single.preview);
      }
      if (roommate.double.front.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(roommate.double.front.preview);
      }
      if (roommate.double.back.preview?.startsWith('blob:')) {
        URL.revokeObjectURL(roommate.double.back.preview);
      }
      updated.splice(index, 1);
      return updated;
    });

    // Remove corresponding mode for the roommate
    this.roommateNationalIdModes.update((modes) => {
      const updated = [...modes];
      updated.splice(index, 1);
      return updated;
    });

    this.updateRoommateNationalIdsFormArray();
  }

  canAddMoreRoommates(): boolean {
    return this.roommateNationalIdFiles().length < 2;
  }

  addRoommateStaffId(): void {
    const current = this.roommatestuffid();
    if (current.length < 2) {
      this.roommatestuffid.set([...current, '']);
      const formArray = this.form.get(RESERVATION_FORM_FIELDS.ROOMMATE_STAFF_ID) as FormArray;
      formArray.push(this.fb.control(''));
    }
  }

  removeRoommateStaffId(index: number): void {
    const current = this.roommatestuffid();
    if (current.length > 1) {
      this.roommatestuffid.update((ids) => {
        const updated = [...ids];
        updated.splice(index, 1);
        return updated;
      });
      const formArray = this.form.get(RESERVATION_FORM_FIELDS.ROOMMATE_STAFF_ID) as FormArray;
      formArray.removeAt(index);
    }
  }

  canAddMoreroommatestuffid(): boolean {
    return this.roommatestuffid().length < 2;
  }

  getRoommateNationalIdFile(
    index: number,
    mode: 'single' | 'double',
    fileType?: 'front' | 'back',
  ): FileUpload {
    const roommate = this.roommateNationalIdFiles()[index];
    if (mode === 'single') {
      return roommate.single;
    } else if (mode === 'double' && fileType === 'front') {
      return roommate.double.front;
    } else if (mode === 'double' && fileType === 'back') {
      return roommate.double.back;
    }
    return {
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      downloadURL: null,
      error: null,
    };
  }

  // ─────────────────────────────────────────
  // SUBMISSION
  // ─────────────────────────────────────────

  trySubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.isSubmitting()) return;
    this.showModal.set(true);
  }

  onModalCancelled(): void {
    this.showModal.set(false);
  }

  async onModalConfirmed(): Promise<void> {
    this.showModal.set(false);
    this.isSubmitting.set(true);
    this.submitError.set(null);

    try {
      const staffId = this.form.get(RESERVATION_FORM_FIELDS.STAFF_ID)!.value as string;
      const name = this.form.get(RESERVATION_FORM_FIELDS.NAME)!.value as string;
      const team = this.form.get(RESERVATION_FORM_FIELDS.DIGITAL_TEAM)!.value as string;
      const roommatestuffidArray = (
        this.form.get(RESERVATION_FORM_FIELDS.ROOMMATE_STAFF_ID) as FormArray
      ).value as string[];
      const note = this.form.get(RESERVATION_FORM_FIELDS.NOTE)!.value as string;
      const transportationType = this.form.get(RESERVATION_FORM_FIELDS.TRANSPORTATION_TYPE)!
        .value as string;
      const wantSingleRoom = this.form.get(RESERVATION_FORM_FIELDS.WANT_SINGLE_ROOM)!
        .value as boolean;

      // Build FormData with files
      const formData = new FormData();
      formData.append(RESERVATION_FORM_FIELDS.STAFF_ID, staffId);
      formData.append(RESERVATION_FORM_FIELDS.NAME, name);
      formData.append(RESERVATION_FORM_FIELDS.DIGITAL_TEAM, team);
      roommatestuffidArray.forEach((roommateStaffId) => {
        if (roommateStaffId && roommateStaffId.trim()) {
          formData.append(RESERVATION_FORM_FIELDS.ROOMMATE_STAFF_ID, roommateStaffId);
        }
      });
      if (note) {
        formData.append(RESERVATION_FORM_FIELDS.NOTE, note);
      }
      formData.append(RESERVATION_FORM_FIELDS.TRANSPORTATION_TYPE, transportationType);
      formData.append(RESERVATION_FORM_FIELDS.WANT_SINGLE_ROOM, String(wantSingleRoom));

      // Add bus reservation file if transportationType is 'Bus'
      if (transportationType === TRANSPORTATION_TYPE.BUS && this.busFile().file) {
        formData.append('busReservation', this.busFile().file!);
      }

      // Add single room reservation file if wantSingleRoom is true
      if (wantSingleRoom && this.singleRoomFile().file) {
        formData.append('singleRoomReservation', this.singleRoomFile().file!);
      }

      // Add National ID files as array based on mode
      if (this.nationalIdMode() === 'single' && this.nationalIdFile().file) {
        formData.append('nationalIds', this.nationalIdFile().file!);
      } else if (this.nationalIdMode() === 'double') {
        if (this.nationalIdFrontFile().file) {
          formData.append('nationalIds', this.nationalIdFrontFile().file!);
        }
        if (this.nationalIdBackFile().file) {
          formData.append('nationalIds', this.nationalIdBackFile().file!);
        }
      }

      // Add roommate national ID files based on each roommate's mode
      this.roommateNationalIdFiles().forEach((roommate, index) => {
        const mode = this.roommateNationalIdModes()[index];
        if (mode === 'single' && roommate.single.file) {
          formData.append('roommateNationalIds', roommate.single.file);
        } else if (mode === 'double') {
          if (roommate.double.front.file) {
            formData.append('roommateNationalIds', roommate.double.front.file);
          }
          if (roommate.double.back.file) {
            formData.append('roommateNationalIds', roommate.double.back.file);
          }
        }
      });

      // Submit to backend
      const response = await this.http
        .post<ReservationResponse>(this.API_URL, formData)
        .toPromise();

      if (response?.id) {
        this.referenceId.set(response.id);
        this.submitted.set(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission failed. Please try again.';
      this.submitError.set(message);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  readonly maxFileSizeMb = MAX_FILE_SIZE_MB;

  isPdf(file: File | null): boolean {
    return file?.type === 'application/pdf' || false;
  }
}
