import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreErrors';

export const HERO_DOC = 'hero/content';
export const ABOUT_DOC = 'about/content';
export const CONTACT_DOC = 'contact/info';
export const SEO_DOC = 'seo/config';
export const AI_DOC = 'ai/content';

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

export async function getDocument<T>(path: string): Promise<T | null> {
  if (!path) return null;
  try {
    return await withRetry(async () => {
      const docRef = doc(db, path);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as T) : null;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveDocument<T extends object>(path: string, data: T): Promise<void> {
  if (!path) return;
  try {
    await withRetry(async () => {
      const docRef = doc(db, path);
      await setDoc(docRef, data, { merge: true });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getCollection<T>(path: string, sortField?: string): Promise<T[]> {
  if (!path) return [];
  try {
    return await withRetry(async () => {
      const colRef = collection(db, path);
      const q = sortField ? query(colRef, orderBy(sortField)) : colRef;
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addCollectionDocument<T extends object>(path: string, data: T): Promise<string> {
  if (!path) throw new Error('Path is required');
  try {
    return await withRetry(async () => {
      const colRef = collection(db, path);
      const docRef = await addDoc(colRef, data);
      return docRef.id;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCollectionDocument<T extends object>(path: string, id: string, data: T): Promise<void> {
  if (!path || !id) return;
  try {
    await withRetry(async () => {
      const docRef = doc(db, path, id);
      await updateDoc(docRef, data as any);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${path}/${id}`);
  }
}

export async function deleteCollectionDocument(path: string, id: string): Promise<void> {
  if (!path || !id) return;
  try {
    await withRetry(async () => {
      const docRef = doc(db, path, id);
      await deleteDoc(docRef);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${id}`);
  }
}
