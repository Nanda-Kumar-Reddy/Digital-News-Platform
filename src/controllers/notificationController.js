import { db } from '../config/database.js';
import { JSON_ERR, JSON_OK } from '../utils/helpers.js';


export const getNotificationSettings = (req, res) => {
  try {
    const userId = req.user.id;

    const row = db.prepare(
      'SELECT breaking, daily, personalized FROM notification_settings WHERE user_id = ?'
    ).get(userId);

    if (!row) {
      return res.json(JSON_OK({
        settings: { breaking: 1, daily: 1, personalized: 1 }
      }));
    }

    return res.json(JSON_OK({ settings: row }));
  } catch (e) {
    console.error('Get notification settings error:', e);
    return res.status(500).json(JSON_ERR('Failed to fetch settings', 'NOTIF_GET_500'));
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { breaking, daily, personalized } = req.body;

    
    const existing = db.prepare('SELECT * FROM notification_settings WHERE user_id = ?').get(userId);

    if (existing) {
      
      db.prepare(`
        UPDATE notification_settings 
        SET breaking = ?, daily = ?, personalized = ? 
        WHERE user_id = ?
      `).run(
        breaking ? 1 : 0,
        daily ? 1 : 0,
        personalized ? 1 : 0,
        userId
      );
    } else {
      
      db.prepare(`
        INSERT INTO notification_settings (user_id, breaking, daily, personalized) 
        VALUES (?, ?, ?, ?)
      `).run(
        userId,
        breaking ? 1 : 0,
        daily ? 1 : 0,
        personalized ? 1 : 0
      );
    }

    return res.status(200).json({ success: true, message: 'Notification settings updated successfully' });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



export const registerDevice = (req, res) => {
  try {
    const userId = req.user.id;
    const { deviceToken, platform } = req.body;

    if (!deviceToken || !platform) {
      return res.status(400).json(JSON_ERR('Missing deviceToken or platform', 'DEVICE_400'));
    }

    db.prepare(`
      INSERT INTO devices (user_id, device_token, platform)
      VALUES (?, ?, ?)
    `).run(userId, deviceToken, platform);

    return res.status(201).json(JSON_OK({ message: 'Device registered successfully' }));
  } catch (e) {
    console.error('Register device error:', e);
    return res.status(500).json(JSON_ERR('Failed to register device', 'DEVICE_500'));
  }
};
