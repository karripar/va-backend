import mongoose, {Schema, Document} from 'mongoose';

// model for storing destination data so scraping is not needed on every request (every 3 days)

interface IDestination {
  country: string;
  title: string;
  link: string;
  coordinates?: {
    lat?: number;
    lon?: number;
  };
}

export interface IDestinationDocument extends Document {
  field: string;
  lang: string;
  sections: Record<string, IDestination[]>;
  lastUpdated: Date;
}

const DestinationSchema: Schema = new Schema({
  field: {type: String, required: true},
  lang: {type: String, required: true},
  sections: {type: Schema.Types.Mixed, required: true},
  lastUpdated: {type: Date, default: Date.now},
});

const DestinationModel = mongoose.model<IDestinationDocument>(
  'Destinations',
  DestinationSchema,
);

export default DestinationModel;
