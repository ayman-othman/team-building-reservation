import { Component, ChangeDetectionStrategy, signal, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  // Form Group with all controls
  form = this.fb.group({
    [RESERVATION_FORM_FIELDS.STAFF_ID]: [
      '',
      [Validators.required, numbersOnlyValidator, outsourceEmployeeValidator],
    ],
    [RESERVATION_FORM_FIELDS.NAME]: ['', [Validators.required]],
    [RESERVATION_FORM_FIELDS.DIGITAL_TEAM]: ['', [Validators.required]],
    [RESERVATION_FORM_FIELDS.TRANSPORTATION_TYPE]: [TRANSPORTATION_TYPE.BUS as string],
    [RESERVATION_FORM_FIELDS.WANT_SINGLE_ROOM]: [false],
    [RESERVATION_FORM_FIELDS.NATIONAL_ID_MODE]: ['single'],
    [RESERVATION_FORM_FIELDS.NOTE]: [''],
  });

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

  // UI state signals
  showModal = signal(false);
  isSubmitting = signal(false);
  submitted = signal(false);
  referenceId = signal<string | null>(null);
  submitError = signal<string | null>(null);
  notesExpanded = signal(false);

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
    target: 'bus' | 'singleRoom' | 'nationalId' | 'nationalIdFront' | 'nationalIdBack',
  ): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.processFile(target, file);
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
    target: 'bus' | 'singleRoom' | 'nationalId' | 'nationalIdFront' | 'nationalIdBack',
  ): void {
    const current = this.getFileSignal(target)();
    if (current.preview?.startsWith('blob:')) {
      URL.revokeObjectURL(current.preview);
    }
    this.getFileSignal(target).set({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      downloadURL: null,
      error: null,
    });
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
      const transportationType = this.form.get(RESERVATION_FORM_FIELDS.TRANSPORTATION_TYPE)!
        .value as string;
      const wantSingleRoom = this.form.get(RESERVATION_FORM_FIELDS.WANT_SINGLE_ROOM)!
        .value as boolean;
      const nationalIdMode = this.form.get(RESERVATION_FORM_FIELDS.NATIONAL_ID_MODE)!
        .value as string;

      // Build FormData with files
      const formData = new FormData();
      formData.append(RESERVATION_FORM_FIELDS.STAFF_ID, staffId);
      formData.append(RESERVATION_FORM_FIELDS.NAME, name);
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

      // Add National ID files as array
      if (nationalIdMode === 'single' && this.nationalIdFile().file) {
        formData.append('nationalIds', this.nationalIdFile().file!);
      } else if (nationalIdMode === 'double') {
        if (this.nationalIdFrontFile().file) {
          formData.append('nationalIds', this.nationalIdFrontFile().file!);
        }
        if (this.nationalIdBackFile().file) {
          formData.append('nationalIds', this.nationalIdBackFile().file!);
        }
      }

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
