import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
import asyncio
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
import pandas as pd

class PredictiveAnalytics:
    def __init__(self):
        self.churn_model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        self._train_models()

    def _train_models(self):
        np.random.seed(42)
        n_samples = 1000

        X = np.random.rand(n_samples, 5)
        X[:, 0] *= 50000  # revenue
        X[:, 1] *= 30000  # cost
        X[:, 2] *= 100    # health_score
        X[:, 3] *= 10     # service_count
        X[:, 4] *= 24     # months_active
        
        y_churn = (X[:, 2] < 50) | (X[:, 0] < X[:, 1])  
        
        # Train models
        X_scaled = self.scaler.fit_transform(X)
        self.churn_model.fit(X_scaled, y_churn)
        self.anomaly_detector.fit(X_scaled)

    async def predict_client_churn(self, clients_data: List[Dict]) -> List[Dict]:

        predictions = []
        
        for client in clients_data:
            features = np.array([[
                client.get('monthly_revenue', 0),
                client.get('monthly_cost', 0),
                client.get('health_score', 50),
                len(client.get('services', [])),
                12  # Assume 12 months active
            ]])
            
            features_scaled = self.scaler.transform(features)
            churn_prob = self.churn_model.predict_proba(features_scaled)[0][1]
            
            risk_level = "High" if churn_prob > 0.7 else "Medium" if churn_prob > 0.4 else "Low"
            
            predictions.append({
                "client_name": client.get('name'),
                "churn_probability": round(churn_prob * 100, 1),
                "risk_level": risk_level,
                "key_factors": self._get_churn_factors(client),
                "recommendations": self._get_retention_recommendations(client, churn_prob)
            })
        
        return sorted(predictions, key=lambda x: x['churn_probability'], reverse=True)

    def _get_churn_factors(self, client: Dict) -> List[str]:
        """Identify key factors contributing to churn risk"""
        factors = []
        
        if client.get('health_score', 100) < 60:
            factors.append("Low health score")
        
        if client.get('monthly_revenue', 0) < client.get('monthly_cost', 0):
            factors.append("Unprofitable client")
        
        if len(client.get('services', [])) < 2:
            factors.append("Limited service engagement")
        
        return factors

    def _get_retention_recommendations(self, client: Dict, churn_prob: float) -> List[str]:
        """Generate retention recommendations"""
        recommendations = []
        
        if churn_prob > 0.6:
            recommendations.append("Schedule immediate client review meeting")
            recommendations.append("Offer service optimization consultation")
        
        if client.get('health_score', 100) < 70:
            recommendations.append("Improve service delivery quality")
            recommendations.append("Increase proactive monitoring")
        
        if client.get('monthly_revenue', 0) < client.get('monthly_cost', 0):
            recommendations.append("Review pricing structure")
            recommendations.append("Optimize service efficiency")
        
        return recommendations

    async def forecast_revenue(self, historical_data: List[Dict]) -> Dict:
        """Forecast revenue for next 6 months using trend analysis"""
        # Simple trend-based forecasting
        revenues = [d.get('revenue', 0) for d in historical_data[-12:]]  # Last 12 months
        
        if len(revenues) < 3:
            return {"error": "Insufficient historical data"}
        
        # Calculate trend
        x = np.arange(len(revenues))
        coeffs = np.polyfit(x, revenues, 1)
        trend = coeffs[0]
        
        # Forecast next 6 months
        forecasts = []
        last_revenue = revenues[-1]
        
        for i in range(1, 7):
            forecast = last_revenue + (trend * i)
            # Add some seasonality and noise
            seasonal_factor = 1 + 0.1 * np.sin(2 * np.pi * i / 12)
            forecast *= seasonal_factor
            forecasts.append(round(forecast, 2))
        
        return {
            "forecasts": forecasts,
            "trend": "Increasing" if trend > 0 else "Decreasing",
            "confidence": "Medium",
            "growth_rate": round((trend / last_revenue) * 100, 2) if last_revenue > 0 else 0
        }

    async def detect_cost_anomalies(self, cost_data: List[Dict]) -> List[Dict]:
        """Detect unusual cost patterns using ML"""
        if len(cost_data) < 10:
            return []
        
        # Prepare features
        features = []
        for data in cost_data:
            features.append([
                data.get('amount', 0),
                data.get('category_id', 0),
                data.get('day_of_week', 1),
                data.get('hour_of_day', 12)
            ])
        
        features_array = np.array(features)
        features_scaled = self.scaler.fit_transform(features_array)
        
        # Detect anomalies
        anomaly_scores = self.anomaly_detector.fit_predict(features_scaled)
        
        anomalies = []
        for i, (data, score) in enumerate(zip(cost_data, anomaly_scores)):
            if score == -1:  # Anomaly detected
                anomalies.append({
                    "id": data.get('id', i),
                    "amount": data.get('amount', 0),
                    "description": data.get('description', 'Unknown expense'),
                    "date": data.get('date', datetime.now().isoformat()),
                    "severity": self._calculate_anomaly_severity(data),
                    "explanation": self._explain_anomaly(data)
                })
        
        return anomalies

    def _calculate_anomaly_severity(self, data: Dict) -> str:
        """Calculate severity of detected anomaly"""
        amount = data.get('amount', 0)
        
        if amount > 10000:
            return "Critical"
        elif amount > 5000:
            return "High"
        elif amount > 1000:
            return "Medium"
        else:
            return "Low"

    def _explain_anomaly(self, data: Dict) -> str:

        amount = data.get('amount', 0)
        
        explanations = [
            f"Cost amount (${amount:,.2f}) is significantly higher than typical patterns",
            "Unusual timing or frequency of expense",
            "Cost category shows abnormal spending pattern"
        ]
        
        return explanations[0] 
predictive_analytics = PredictiveAnalytics()