from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class SubscriptionPlan(BaseModel):
    plan_id: str
    name: str
    price: float

@router.get("/plans", response_model=list[SubscriptionPlan])
def get_billing_plans():
    """
    Get available subscription plans.
    """
    return [
        {"plan_id": "pro", "name": "Pro", "price": 49.99},
        {"plan_id": "enterprise", "name": "Enterprise", "price": 249.99}
    ]

@router.post("/checkout")
def create_checkout_session(plan_id: str):
    """
    Create a Stripe checkout session (Mocked).
    """
    return {"checkout_url": "https://checkout.stripe.com/pay/mock"}
