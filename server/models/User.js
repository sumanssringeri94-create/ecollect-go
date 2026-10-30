const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    points: {
      type: Number,
      default: 0,
    },
    totalItemsRecycled: {
      type: Number,
      default: 0,
    },
    co2Saved: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      default: 'Eco Starter',
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update level based on points
userSchema.methods.updateLevel = function () {
  if (this.points >= 5000) this.level = 'Eco Champion';
  else if (this.points >= 2000) this.level = 'Eco Guardian';
  else if (this.points >= 800) this.level = 'Eco Warrior';
  else if (this.points >= 200) this.level = 'Eco Starter';
  else this.level = 'Beginner';
};

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = new Proxy(MongooseUser, {
  construct(target, args) {
    if (process.env.USE_LOCAL_DB === 'true') {
      const { createModelInstance } = require('../localDb');
      return createModelInstance('users', args[0]);
    }
    return new target(...args);
  },
  get(target, prop) {
    if (process.env.USE_LOCAL_DB === 'true') {
      const { User } = require('../localDb');
      return User[prop];
    }
    return target[prop];
  },
});
