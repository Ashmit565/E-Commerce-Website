import re
from typing import List, Dict, Optional, Tuple

class FAQService:
    """
    RAG / Knowledge base containing the actual, verified store policies
    of E-Commerce Website. Never invents policies or timelines.
    """
    
    POLICIES: List[Dict[str, str]] = [
        {
            "id": "shipping_policy",
            "topic": "Shipping and Delivery",
            "keywords": ["shipping", "delivery", "dispatch", "courier", "track shipment", "free delivery", "delivery charges", "timeline"],
            "content": (
                "Orders are processed and dispatched within 24 hours of confirmation. "
                "Standard delivery takes 2 to 4 business days across India. "
                "Delivery is FREE on all orders of ₹500 or more; a flat ₹50 fee applies for orders below ₹500. "
                "You can track real-time delivery milestones in your Orders page."
            )
        },
        {
            "id": "return_replacement_policy",
            "topic": "Returns and Replacements",
            "keywords": ["return", "replace", "replacement", "damaged", "defective", "broken", "exchange", "warranty"],
            "content": (
                "We provide a 7-Day Hassle-Free Replacement Policy for items that arrive damaged, defective, "
                "or significantly different from their description. Eligible electronics also include a 1-Year Comprehensive "
                "Manufacturer Warranty. To request a replacement, please retain the original product box and contact support."
            )
        },
        {
            "id": "refund_policy",
            "topic": "Refunds and Processing Timelines",
            "keywords": ["refund", "money back", "refund status", "bank transfer", "credit card refund"],
            "content": (
                "Once a returned item is received and inspected at our fulfillment center, refunds are approved immediately. "
                "The amount is refunded to your original payment method (Credit/Debit Card, UPI, or Bank Account) "
                "within 5 to 7 business days depending on your banking institution."
            )
        },
        {
            "id": "cancellation_policy",
            "topic": "Order Cancellation",
            "keywords": ["cancel", "cancellation", "cancel order", "stop order"],
            "content": (
                "You can cancel your order at any time while its status is 'Pending', 'Confirmed', or 'Processing'. "
                "Simply visit your Orders page and click 'Cancel Order'. Product stock is immediately released back "
                "to the catalog and your payment is queued for refund. Once an order is 'Shipped' or 'Delivered', "
                "it can no longer be cancelled but is eligible for our 7-day replacement policy."
            )
        },
        {
            "id": "payment_methods",
            "topic": "Accepted Payment Methods",
            "keywords": ["payment", "payment methods", "upi", "card", "credit card", "debit card", "cod", "cash on delivery", "secure payment"],
            "content": (
                "We support 100% secure payments via Credit/Debit Cards (Visa, MasterCard, RuPay), "
                "UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, and Cash on Delivery (COD). "
                "We also offer a safe test 'Simulated Instant Payment' mode for demo testing. "
                "All transactions use 256-bit SSL encryption."
            )
        },
        {
            "id": "customer_support",
            "topic": "Customer Support and Contact",
            "keywords": ["contact", "support", "customer care", "helpdesk", "phone number", "email", "helpline", "hours"],
            "content": (
                "Our customer care team is available 7 days a week from 9:00 AM to 9:00 PM IST.\n"
                "• Email: support@ecommercewebsite.com\n"
                "• Helpline: +91 (080) 4567-8900\n"
                "• Headquarters: MG Road, Bengaluru, Karnataka 560001, India."
            )
        },
        {
            "id": "account_management",
            "topic": "Account & Addresses",
            "keywords": ["account", "password", "profile", "change password", "address", "update profile"],
            "content": (
                "You can update your personal profile, change passwords securely, and manage multiple saved shipping "
                "addresses directly from the 'Profile' page. Your address can also be set as default for 1-click checkout."
            )
        }
    ]

    @classmethod
    def search_faq(cls, query: str) -> Optional[Tuple[str, str]]:
        """
        Retrieves the most relevant policy document for a given user query.
        Returns (topic, content) or None if no high-confidence match.
        """
        query_lower = query.lower()
        best_match = None
        highest_score = 0

        for policy in cls.POLICIES:
            score = 0
            # Check keywords
            for kw in policy["keywords"]:
                if kw in query_lower:
                    score += 2
            # Check topic words
            for word in policy["topic"].lower().split():
                if len(word) > 3 and word in query_lower:
                    score += 1

            if score > highest_score:
                highest_score = score
                best_match = policy

        if best_match and highest_score >= 2:
            return best_match["topic"], best_match["content"]
        return None

    @classmethod
    def get_all_policy_context(cls) -> str:
        """
        Returns full policy text for system prompt grounding.
        """
        lines = []
        for p in cls.POLICIES:
            lines.append(f"[{p['topic']}]: {p['content']}")
        return "\n\n".join(lines)

