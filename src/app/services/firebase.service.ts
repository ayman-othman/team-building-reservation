import { Injectable } from '@angular/core';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Firestore, serverTimestamp } from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  FirebaseStorage,
} from 'firebase/storage';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

export interface UploadProgress {
  progress: number;
  downloadURL?: string;
  error?: string;
}

export interface ReservationData {
  staffId: string;
  busReservationUrl?: string | null;
  nationalIdFrontUrl: string;
  nationalIdBackUrl?: string | null;
  isSingleNationalId: boolean;
  submittedAt: unknown;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private readonly app?: FirebaseApp;
  private readonly db?: Firestore;
  private readonly storage?: FirebaseStorage;

  constructor() {
    // Firebase is no longer used - keeping this service for reference
    // If needed in the future, uncomment the initialization below
    /*
    this.app =
      getApps().length === 0
        ? initializeApp(environment.firebaseConfig)
        : getApps()[0];
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);
    */
  }

  // Firebase methods are deprecated - using local backend instead
  /*
  uploadFile(file: File, path: string): Observable<UploadProgress> {
    return new Observable<UploadProgress>((observer) => {
      const storageRef = ref(this.storage!, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          observer.next({ progress });
        },
        (error) => {
          observer.next({ progress: 0, error: error.message });
          observer.error(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          observer.next({ progress: 100, downloadURL });
          observer.complete();
        }
      );
    });
  }

  async submitReservation(
    data: Omit<ReservationData, 'submittedAt' | 'status'>
  ): Promise<string> {
    const reservationsRef = collection(this.db!, 'reservations');
    const docRef = await addDoc(reservationsRef, {
      ...data,
      submittedAt: serverTimestamp(),
      status: 'pending',
    });
    return docRef.id;
  }
  */
}
