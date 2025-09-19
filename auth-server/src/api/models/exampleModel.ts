// exampleModel.ts
// This is an example of a Mongoose model. You can delete this file if you don't need it.

/* import mongoose from 'mongoose';
import {Animal, AnimalModel} from '../../types/localTypes';

const animalSchema = new mongoose.Schema<Animal>({
  animal_name: {
    type: String,
    required: true,
    minLength: 2,
  },
  birthdate: {
    type: Date,
    required: true,
    max: Date.now(),
  },
  species: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Species',
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere',
    },
  },
});

animalSchema.statics.findBySpecies = function (species_name: string) {
  return this.aggregate([
    {
      $lookup: {
        from: 'species',
        localField: 'species',
        foreignField: '_id',
        as: 'species',
      },
    },
    {
      $unwind: '$species',
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'species.category',
        foreignField: '_id',
        as: 'species.category',
      },
    },
    {
      $unwind: '$species.category',
    },
    {
      $match: {
        'species.species_name': species_name,
      },
    },
    {
      $project: {
        __v: 0,
        'species.__v': 0,
        'species.category.__v': 0,
      },
    },
  ]);
};

export default mongoose.model<Animal, AnimalModel>('Animal', animalSchema);
 */
