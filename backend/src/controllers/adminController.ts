import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User, { IUser } from '../models/User';
import Progress from '../models/Progress';

const toPlainUser = (user: IUser) => {
  const plain = user.toObject({ getters: true, virtuals: false }) as Record<string, unknown>;
  delete plain.password;
  return {
    ...plain,
    _id: user._id.toString(),
  };
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(
      users.map((user) => ({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        level: user.level,
        points: user.points,
        lastActivityDate: user.lastActivityDate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }))
    );
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, age, role = 'user' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, E-Mail und Passwort sind erforderlich.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Ein Benutzer mit dieser E-Mail existiert bereits.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      age,
      role: role === 'admin' ? 'admin' : 'user',
    });

    res.status(201).json(toPlainUser(user));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Ungültige Benutzer-ID.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
    }

    const { name, email, password, age, role } = req.body;

    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return res.status(400).json({ message: 'E-Mail-Adresse wird bereits verwendet.' });
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    if (typeof age === 'number') {
      user.age = age;
    }

    if (role) {
      user.role = role === 'admin' ? 'admin' : 'user';
    }

    if (password) {
      user.password = password;
    }

    const updated = await user.save();
    res.json(toPlainUser(updated));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Ungültige Benutzer-ID.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
    }

    await Progress.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({ message: 'Benutzer und zugehörige Daten wurden gelöscht.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getDailyAnalytics = async (req: Request, res: Response) => {
  try {
    const rangeDays = Math.max(parseInt(String(req.query.range ?? '7'), 10) || 7, 1);
    const fromParam = req.query.from ? new Date(String(req.query.from)) : undefined;
    const toParam = req.query.to ? new Date(String(req.query.to)) : undefined;

    const endDate = toParam && !Number.isNaN(toParam.getTime()) ? toParam : new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = fromParam && !Number.isNaN(fromParam.getTime()) ? fromParam : new Date(endDate);
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (rangeDays - 1));

    const results = await Progress.aggregate<{
      day: string;
      dailyActiveUsers: number;
      completedExercises: number;
      abortedExercises: number;
    }>([
      {
        $match: {
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $addFields: {
          day: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date',
            },
          },
        },
      },
      {
        $group: {
          _id: '$day',
          activeUsers: { $addToSet: '$user' },
          completedExercises: {
            $sum: {
              $cond: [{ $eq: ['$completed', true] }, 1, 0],
            },
          },
          abortedExercises: {
            $sum: {
              $cond: [{ $eq: ['$aborted', true] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          day: '$_id',
          dailyActiveUsers: { $size: '$activeUsers' },
          completedExercises: 1,
          abortedExercises: 1,
        },
      },
      {
        $sort: { day: 1 },
      },
    ]);

    const lookup = new Map(results.map((item) => [item.day, item]));

    const dayCursor = new Date(startDate);
    const data: {
      day: string;
      dailyActiveUsers: number;
      completedExercises: number;
      abortedExercises: number;
    }[] = [];

    while (dayCursor <= endDate) {
      const dayKey = dayCursor.toISOString().slice(0, 10);
      const entry = lookup.get(dayKey);
      data.push({
        day: dayKey,
        dailyActiveUsers: entry?.dailyActiveUsers ?? 0,
        completedExercises: entry?.completedExercises ?? 0,
        abortedExercises: entry?.abortedExercises ?? 0,
      });
      dayCursor.setDate(dayCursor.getDate() + 1);
    }

    res.json({
      from: startDate.toISOString(),
      to: endDate.toISOString(),
      range: data.length,
      data,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
