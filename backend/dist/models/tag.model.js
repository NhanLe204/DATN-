import mongoose, { Schema, model } from 'mongoose';
const tagSchema = new Schema({
    tag_name: {
        type: String,
        default: ''
    }
});
const tagModel = mongoose.models.tag || model('tag', tagSchema);
export default tagModel;
//# sourceMappingURL=tag.model.js.map