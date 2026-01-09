db = db.getSiblingDB('optimsp');

db.createUser({
  user: 'optimsp_user',
  pwd: 'optimsp_password_change_in_production',
  roles: [
    {
      role: 'readWrite',
      db: 'optimsp'
    }
  ]
});

db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "created_at": 1 });

db.team_members.createIndex({ "email": 1 }, { unique: true });
db.team_members.createIndex({ "department": 1 });

db.clients.createIndex({ "name": 1 });
db.clients.createIndex({ "status": 1 });

db.anomalies.createIndex({ "client_id": 1 });
db.anomalies.createIndex({ "status": 1 });
db.anomalies.createIndex({ "created_at": 1 });

db.chat_conversations.createIndex({ "user_id": 1 });
db.chat_conversations.createIndex({ "created_at": 1 });

print('Database initialized successfully');