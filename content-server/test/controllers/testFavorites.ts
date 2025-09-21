// placeholder test controller for development guideline

/* import {Express} from 'express';
import request from 'supertest';
import {MessageResponse} from '../../src/types/MessageTypes';



const getFavorites = (app: Express): Promise<Testfavorite[]> => {
  return new Promise((resolve, reject) => {
    request(app)
      .get('/api/v1/favorites')
      .expect(200, (err, response) => {
        if (err) {
          reject(err);
        } else {
          const favorites: TestFavorite[] = response.body;
          favorites.forEach((favorite) => {
            expect(favorite._id).not.toBe('');
            expect(favorite.favorite_name).not.toBe('');
          });
          resolve(favorites);
        }
      });
  });
};

export {getFavorites};
 */
