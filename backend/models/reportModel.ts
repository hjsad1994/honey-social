import mongoose from 'mongoose';

// Add this interface to describe document structure for TypeScript
interface IReportDocument {
  reportedBy: string;
  [key: string]: any;
}

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
    reportedByUsername: {  // Thêm trường mới
      type: String,
      default: 'Hệ thống tự động',
    },
    reason: {
      type: String,
      // Add proper "this" type annotation so TypeScript knows it has reportedBy property
      required: function(this: IReportDocument) { return this.reportedBy !== 'system'; }
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