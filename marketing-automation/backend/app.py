from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import jwt
import os
from functools import wraps

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///marketing.db'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-prod')
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(120))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    campaigns = db.relationship('Campaign', backref='user', lazy=True)
    contacts = db.relationship('Contact', backref='user', lazy=True)

class Campaign(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    platform = db.Column(db.String(50))
    status = db.Column(db.String(20), default='draft')
    scheduled_for = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    metrics = db.relationship('Metric', backref='campaign', lazy=True)

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    name = db.Column(db.String(120))
    segment = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Metric(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'), nullable=False)
    impressions = db.Column(db.Integer, default=0)
    clicks = db.Column(db.Integer, default=0)
    conversions = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return {'message': 'Token missing'}, 401
        try:
            token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
        except:
            return {'message': 'Token invalid'}, 401
        return f(current_user, *args, **kwargs)
    return decorated

@app.before_request
def create_tables():
    db.create_all()

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data.get('email')).first():
        return {'message': 'User exists'}, 400

    user = User(
        email=data.get('email'),
        password=data.get('password'),
        name=data.get('name', '')
    )
    db.session.add(user)
    db.session.commit()

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=30)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return {'token': token, 'user': {'id': user.id, 'email': user.email}}, 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()

    if not user or user.password != data.get('password'):
        return {'message': 'Invalid credentials'}, 401

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=30)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return {'token': token, 'user': {'id': user.id, 'email': user.email}}, 200

@app.route('/api/campaigns', methods=['GET'])
@token_required
def get_campaigns(current_user):
    campaigns = Campaign.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'platform': c.platform,
        'status': c.status,
        'scheduled_for': c.scheduled_for.isoformat() if c.scheduled_for else None,
        'created_at': c.created_at.isoformat()
    } for c in campaigns])

@app.route('/api/campaigns', methods=['POST'])
@token_required
def create_campaign(current_user):
    data = request.get_json()
    campaign = Campaign(
        user_id=current_user.id,
        name=data.get('name'),
        platform=data.get('platform'),
        status='draft'
    )
    db.session.add(campaign)
    db.session.commit()
    return {'id': campaign.id, 'message': 'Campaign created'}, 201

@app.route('/api/campaigns/<int:id>', methods=['PUT'])
@token_required
def update_campaign(current_user, id):
    campaign = Campaign.query.filter_by(id=id, user_id=current_user.id).first()
    if not campaign:
        return {'message': 'Not found'}, 404

    data = request.get_json()
    campaign.name = data.get('name', campaign.name)
    campaign.status = data.get('status', campaign.status)
    campaign.platform = data.get('platform', campaign.platform)
    campaign.updated_at = datetime.utcnow()
    db.session.commit()

    return {'message': 'Campaign updated'}, 200

@app.route('/api/campaigns/<int:id>', methods=['DELETE'])
@token_required
def delete_campaign(current_user, id):
    campaign = Campaign.query.filter_by(id=id, user_id=current_user.id).first()
    if not campaign:
        return {'message': 'Not found'}, 404
    db.session.delete(campaign)
    db.session.commit()
    return {'message': 'Campaign deleted'}, 200

@app.route('/api/contacts', methods=['GET'])
@token_required
def get_contacts(current_user):
    contacts = Contact.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'email': c.email,
        'phone': c.phone,
        'segment': c.segment
    } for c in contacts])

@app.route('/api/contacts', methods=['POST'])
@token_required
def create_contact(current_user):
    data = request.get_json()
    contact = Contact(
        user_id=current_user.id,
        name=data.get('name'),
        email=data.get('email'),
        phone=data.get('phone'),
        segment=data.get('segment', 'general')
    )
    db.session.add(contact)
    db.session.commit()
    return {'id': contact.id, 'message': 'Contact added'}, 201

@app.route('/api/metrics/<int:campaign_id>', methods=['GET'])
@token_required
def get_metrics(current_user, campaign_id):
    campaign = Campaign.query.filter_by(id=campaign_id, user_id=current_user.id).first()
    if not campaign:
        return {'message': 'Not found'}, 404

    metrics = Metric.query.filter_by(campaign_id=campaign_id).all()
    return jsonify([{
        'id': m.id,
        'impressions': m.impressions,
        'clicks': m.clicks,
        'conversions': m.conversions,
        'created_at': m.created_at.isoformat()
    } for m in metrics])

@app.route('/api/metrics/<int:campaign_id>', methods=['POST'])
@token_required
def add_metric(current_user, campaign_id):
    campaign = Campaign.query.filter_by(id=campaign_id, user_id=current_user.id).first()
    if not campaign:
        return {'message': 'Not found'}, 404

    data = request.get_json()
    metric = Metric(
        campaign_id=campaign_id,
        impressions=data.get('impressions', 0),
        clicks=data.get('clicks', 0),
        conversions=data.get('conversions', 0)
    )
    db.session.add(metric)
    db.session.commit()
    return {'id': metric.id, 'message': 'Metric added'}, 201

@app.route('/api/health', methods=['GET'])
def health():
    return {'status': 'ok', 'timestamp': datetime.utcnow().isoformat()}

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
