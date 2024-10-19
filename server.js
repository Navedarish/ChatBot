import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import natural from 'natural';
import * as tf from '@tensorflow/tfjs-node';

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/heartguard', { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  healthData: {
    age: Number,
    gender: String,
    weight: Number,
    height: Number,
    bloodPressure: [{ systolic: Number, diastolic: Number, date: Date }],
    heartRate: [{ value: Number, date: Date }]
  }
});

const User = mongoose.model('User', UserSchema);

// NLP setup
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// Train the classifier with some sample intents
classifier.addDocument('What is my heart failure risk?', 'risk_assessment');
classifier.addDocument('Can you assess my heart health?', 'risk_assessment');
classifier.addDocument('How is my blood pressure?', 'blood_pressure');
classifier.addDocument('What\'s my heart rate like?', 'heart_rate');
classifier.addDocument('Update my health information', 'update_health');
classifier.train();

// Simple ML model for heart failure risk assessment
const createModel = () => {
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [5] }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
  model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });
  return model;
};

const model = createModel();

// Mock function to predict heart failure risk
const predictHeartFailureRisk = (age, systolicBP, diastolicBP, heartRate, bmi) => {
  const input = tf.tensor2d([[age, systolicBP, diastolicBP, heartRate, bmi]]);
  const prediction = model.predict(input);
  return prediction.dataSync()[0];
};

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tokens = tokenizer.tokenize(message.toLowerCase());
    const intent = classifier.classify(tokens.join(' '));

    let response;
    switch (intent) {
      case 'risk_assessment':
        const latestBP = user.healthData.bloodPressure[user.healthData.bloodPressure.length - 1];
        const latestHR = user.healthData.heartRate[user.healthData.heartRate.length - 1];
        const bmi = user.healthData.weight / ((user.healthData.height / 100) ** 2);
        const risk = predictHeartFailureRisk(user.healthData.age, latestBP.systolic, latestBP.diastolic, latestHR.value, bmi);
        response = `Based on your current health data, your estimated heart failure risk is ${(risk * 100).toFixed(2)}%. Remember, this is just an estimate and you should consult with a healthcare professional for a more accurate assessment.`;
        break;
      case 'blood_pressure':
        const bp = user.healthData.bloodPressure[user.healthData.bloodPressure.length - 1];
        response = `Your latest blood pressure reading was ${bp.systolic}/${bp.diastolic} mmHg on ${bp.date.toLocaleDateString()}.`;
        break;
      case 'heart_rate':
        const hr = user.healthData.heartRate[user.healthData.heartRate.length - 1];
        response = `Your latest heart rate reading was ${hr.value} bpm on ${hr.date.toLocaleDateString()}.`;
        break;
      case 'update_health':
        response = "To update your health information, please go to your user profile and enter the new data there.";
        break;
      default:
        response = "I'm sorry, I didn't understand that. Could you please rephrase your question?";
    }

    res.json({ message: response });
  } catch (error) {
    res.status(500).json({ message: 'Error processing chat message' });
  }
});

app.get('/api/user/health', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.healthData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching health data' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));