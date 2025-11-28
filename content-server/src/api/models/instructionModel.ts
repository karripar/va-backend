import {Schema, model} from 'mongoose';

interface IInstructionLink {
  stepIndex: number;
  labelFi?: string;
  labelEn?: string;
  href: string;
  isExternal: boolean; // true = external link, false = internal route
  isFile: boolean; // true = PDF, etc. file, false = link
  updatedAt: Date;
}

const instructionLinksSchema = new Schema<IInstructionLink>(
  {
    stepIndex: {
      type: Number,
      required: true,
    },
    labelFi: {
      type: String,
      required: false,
    },
    labelEn: {
      type: String,
      required: false,
    },
    href: {
      type: String,
      required: true,
    },
    isExternal: {
      type: Boolean,
      default: true,
    },
    isFile: {
      type: Boolean,
      default: false,
    },
  },
  {timestamps: true},
);

const InstructionLink = model<IInstructionLink>(
  'InstructionLink',
  instructionLinksSchema,
);

interface IInstructionVisibility {
  stepIndex: number;
  isVisible: boolean;
}

const instructionVisibilitySchema = new Schema<IInstructionVisibility>(
  {
    stepIndex: {
      type: Number,
      required: true,
      unique: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {timestamps: true},
);

const InstructionVisibility = model<IInstructionVisibility>(
  'InstructionVisibility',
  instructionVisibilitySchema,
);

// ohjesteppi, sisältää otsikon ja tekstin molemmilla kielillä
interface IInstructionStep {
  stepIndex: number;
  titleFi: string;
  titleEn: string;
  textFi: string;
  textEn: string;
}

const instructionStepSchema = new Schema<IInstructionStep>(
  {
    stepIndex: {type: Number, required: true, unique: true},
    titleFi: {type: String, required: true},
    titleEn: {type: String, required: true},
    textFi: {type: String, required: true},
    textEn: {type: String, required: true},
  },
  {timestamps: true},
);

const InstructionStep = model<IInstructionStep>(
  'InstructionStep',
  instructionStepSchema,
);

export {
  InstructionLink,
  IInstructionLink,
  InstructionVisibility,
  IInstructionVisibility,
  InstructionStep,
  IInstructionStep,
};
