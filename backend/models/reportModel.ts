import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    postContent: {
      type: String,
      required: true,
    },
    reportedBy: {
      type: String,
      default: 'system',
    },
    moderationResult: {
      type: Object,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    },
    resolution: {
      type: String,
      enum: ['deleted', 'ignored', ''],
      default: '',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;