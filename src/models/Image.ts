import mongoose, { Document, Schema } from 'mongoose';

export type ImageStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface IImage extends Document {
  originalName: string;
  originalPath: string;
  processedPath: string;
  thumbnailPath: string;
  mimeType: string;
  originalSize: number;
  processedSize: number;
  width: number;
  height: number;
  status: ImageStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema: Schema = new Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    originalPath: {
      type: String,
      required: true
    },
    processedPath: {
      type: String,
      default: ''
    },
    thumbnailPath: {
      type: String,
      default: ''
    },
    mimeType: {
      type: String,
      required: true
    },
    originalSize: {
      type: Number,
      required: true
    },
    processedSize: {
      type: Number,
      default: 0
    },
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PROCESSING'
    }
  },
  {
    timestamps: true
  }
);

export const Image = mongoose.model<IImage>('Image', ImageSchema);
