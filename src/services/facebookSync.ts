import { doc, setDoc, writeBatch, collection, getDocs, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface FBAlbum {
  id: string;
  name: string;
  description?: string;
  count: number;
  cover_photo?: {
    source: string;
    id: string;
  };
  created_time: string;
}

export interface FBPhoto {
  id: string;
  source: string;
  name?: string;
  created_time: string;
}

export interface SyncStats {
  albumsSynced: number;
  photosSynced: number;
  errors: string[];
}

/**
 * Sync albums and photos from school Facebook Page to Firestore
 */
export async function syncFacebookGallery(
  pageId: string,
  accessToken: string,
  onProgress?: (status: string) => void
): Promise<SyncStats> {
  const stats: SyncStats = {
    albumsSynced: 0,
    photosSynced: 0,
    errors: [],
  };

  const notify = (msg: string) => {
    if (onProgress) onProgress(msg);
    console.log(`[FB Sync] ${msg}`);
  };

  if (!pageId || !accessToken) {
    throw new Error('ID Halaman Facebook dan Token Akses harus diisi.');
  }

  // Clean inputs
  const cleanPageId = pageId.trim();
  const cleanToken = accessToken.trim();

  try {
    notify('Menghubungkan ke Facebook Graph API...');
    const albumsUrl = `https://graph.facebook.com/v19.0/${cleanPageId}/albums?fields=id,name,description,count,cover_photo{source,id},created_time&limit=25&access_token=${cleanToken}`;
    
    const response = await fetch(albumsUrl);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const fbErrMsg = errData?.error?.message || 'Gagal mengambil data album';
      throw new Error(`Facebook API Error: ${fbErrMsg}`);
    }

    const { data: fbAlbums }: { data: FBAlbum[] } = await response.json();
    
    if (!fbAlbums || fbAlbums.length === 0) {
      notify('Tidak ditemukan album publik di halaman Facebook ini.');
      return stats;
    }

    notify(`Ditemukan ${fbAlbums.length} album. Memulai sinkronisasi...`);

    for (const album of fbAlbums) {
      try {
        notify(`Menyinkronkan info album: "${album.name}"...`);

        // 1. Save or update album in 'gallery_albums'
        const albumRef = doc(db, 'gallery_albums', album.id);
        const albumData = {
          name: album.name,
          description: album.description || '',
          coverUrl: album.cover_photo?.source || '',
          photoCount: album.count || 0,
          facebookId: album.id,
          source: 'facebook',
          createdAt: new Date(album.created_time),
          updatedAt: new Date(),
        };
        await setDoc(albumRef, albumData, { merge: true });
        stats.albumsSynced++;

        // 2. Fetch photos inside this album
        notify(`Mengambil foto dari album "${album.name}"...`);
        const photosUrl = `https://graph.facebook.com/v19.0/${album.id}/photos?fields=id,source,name,created_time&limit=100&access_token=${cleanToken}`;
        const photosResponse = await fetch(photosUrl);
        
        if (!photosResponse.ok) {
          stats.errors.push(`Gagal mengambil foto untuk album "${album.name}"`);
          continue;
        }

        const { data: fbPhotos }: { data: FBPhoto[] } = await photosResponse.json();

        if (fbPhotos && fbPhotos.length > 0) {
          notify(`Mengimpor ${fbPhotos.length} foto dari album "${album.name}"...`);
          
          // Use a batch to write documents sets
          // Firestore batch supports up to 500 operations
          let batch = writeBatch(db);
          let count = 0;

          for (const photo of fbPhotos) {
            const photoRef = doc(db, 'gallery', photo.id);
            const photoData = {
              title: photo.name || album.name, // Fallback to album name if caption is empty
              imageUrl: photo.source,
              category: 'Facebook',
              albumId: album.id,
              facebookId: photo.id,
              source: 'facebook',
              createdAt: new Date(photo.created_time),
              updatedAt: new Date(),
            };

            batch.set(photoRef, photoData, { merge: true });
            count++;
            stats.photosSynced++;

            if (count >= 400) {
              await batch.commit();
              batch = writeBatch(db);
              count = 0;
            }
          }

          if (count > 0) {
            await batch.commit();
          }
        }
      } catch (albumErr: any) {
        console.error(`Error syncing album ${album.name}:`, albumErr);
        stats.errors.push(`Gagal menyinkronkan album "${album.name}": ${albumErr.message || albumErr}`);
      }
    }

    notify('Sinkronisasi selesai dengan sukses!');
    return stats;
  } catch (error: any) {
    console.error('FB Sync main error:', error);
    throw error;
  }
}
