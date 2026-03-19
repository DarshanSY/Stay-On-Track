from extensions import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, default="Admin User")
    email = db.Column(db.String(120), unique=True, nullable=False, default="admin@stayontrack.edu")
    role = db.Column(db.String(20), default="admin")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role
        }
