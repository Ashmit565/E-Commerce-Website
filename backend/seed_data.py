import sys
import os
from decimal import Decimal

# Add current path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.models.address import Address
from app.models.order import Order, OrderItem
from app.models.payment import Payment
from app.models.review import Review
from app.utils.security import hash_password
from app.utils.validators import slugify, generate_order_number, generate_transaction_id

def seed_database():
    print("Starting database seeding...")
    db = SessionLocal()

    try:
        # 1. Admin & Customer Users
        admin_email = "admin@shopsphere.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                hashed_password=hash_password("Admin@123456"),
                full_name="Administrator",
                phone_number="+91 9876543210",
                role="admin",
                is_active=True
            )
            db.add(admin)
            print(f"Created Admin user: {admin_email}")

        customer_email = "john@example.com"
        customer = db.query(User).filter(User.email == customer_email).first()
        if not customer:
            customer = User(
                email=customer_email,
                hashed_password=hash_password("Password@123"),
                full_name="John Doe",
                phone_number="+91 9123456780",
                role="customer",
                is_active=True
            )
            db.add(customer)
            print(f"Created Customer user: {customer_email}")

        db.flush()

        # 2. Customer Address
        cust_addr = db.query(Address).filter(Address.user_id == customer.id).first()
        if not cust_addr:
            cust_addr = Address(
                user_id=customer.id,
                full_name="John Doe",
                phone_number="+91 9123456780",
                address_line1="Flat 402, Lotus Heights, Park Avenue",
                address_line2="Near Metro Station",
                city="Bengaluru",
                state="Karnataka",
                postal_code="560001",
                country="India",
                is_default=True
            )
            db.add(cust_addr)
            db.flush()
            print("Created demo customer address")

        # 3. Categories (6 categories)
        categories_data = [
            {
                "name": "Electronics",
                "slug": "electronics",
                "description": "Cutting-edge smartphones, laptops, audio gear, and smart gadgets.",
                "image_url": "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Fashion",
                "slug": "fashion",
                "description": "Trending apparel, premium watches, footwear, and designer accessories.",
                "image_url": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Home & Living",
                "slug": "home-living",
                "description": "Modern furniture, kitchenware, aesthetic home decor, and lighting.",
                "image_url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Beauty",
                "slug": "beauty",
                "description": "Luxury skincare, organic cosmetics, fragrances, and wellness essentials.",
                "image_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Sports",
                "slug": "sports",
                "description": "Performance activewear, fitness gear, gym equipment, and outdoor accessories.",
                "image_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": "Books",
                "slug": "books",
                "description": "Best-selling fiction, business leadership, science, and self-help literature.",
                "image_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80"
            }
        ]

        cat_map = {}
        for cdata in categories_data:
            cat = db.query(Category).filter(Category.slug == cdata["slug"]).first()
            if not cat:
                cat = Category(**cdata)
                db.add(cat)
                db.flush()
                print(f"Created category: {cat.name}")
            cat_map[cdata["slug"]] = cat

        # 4. Products (36 total products, 6 per category)
        products_data = [
            # ELECTRONICS
            {
                "cat": "electronics",
                "name": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
                "description": "Industry-leading noise cancellation with dual processors, 8 microphones, and Auto NC Optimizer. High-resolution audio with 30-hour battery life and ultra-comfortable lightweight design.",
                "price": Decimal("26990.00"),
                "original_price": Decimal("34990.00"),
                "discount_percent": 23,
                "stock": 25,
                "rating": Decimal("4.8"),
                "num_reviews": 142,
                "is_featured": True,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "electronics",
                "name": "Apple MacBook Air M3 15-inch Laptop",
                "description": "Supercharged by the M3 chip with an 8-core CPU and 10-core GPU. Striking Liquid Retina display, 18 hours of battery life, 1080p FaceTime HD camera, and spatial audio with Dolby Atmos.",
                "price": Decimal("124900.00"),
                "original_price": Decimal("134900.00"),
                "discount_percent": 7,
                "stock": 15,
                "rating": Decimal("4.9"),
                "num_reviews": 89,
                "is_featured": True,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "electronics",
                "name": "Samsung Galaxy S24 Ultra 5G Smartphone",
                "description": "Titanium frame with Galaxy AI capabilities. 200MP camera with 100x Space Zoom, Snapdragon 8 Gen 3 for Galaxy, Dynamic AMOLED 2X flat display with Corning Gorilla Armor.",
                "price": Decimal("119999.00"),
                "original_price": Decimal("134999.00"),
                "discount_percent": 11,
                "stock": 30,
                "rating": Decimal("4.7"),
                "num_reviews": 210,
                "is_featured": True,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "electronics",
                "name": "Apple Watch Ultra 2 GPS + Cellular",
                "description": "Rugged 49mm titanium case with Precision dual-frequency GPS. Up to 36 hours normal use and 72 hours low power mode. Depth gauge and water temperature sensor rated to 100m.",
                "price": Decimal("84900.00"),
                "original_price": Decimal("89900.00"),
                "discount_percent": 6,
                "stock": 18,
                "rating": Decimal("4.9"),
                "num_reviews": 65,
                "is_featured": False,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "electronics",
                "name": "Fujifilm X-T5 Mirrorless Digital Camera",
                "description": "40.2MP X-Trans CMOS 5 HR sensor with 5-axis 7.0 stop in-body image stabilization. Compact, weather-resistant body with 3-way tilting LCD and dual SD card slots.",
                "price": Decimal("154999.00"),
                "original_price": Decimal("169999.00"),
                "discount_percent": 9,
                "stock": 8,
                "rating": Decimal("4.8"),
                "num_reviews": 43,
                "is_featured": False,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "electronics",
                "name": "Logitech MX Master 3S Wireless Performance Mouse",
                "description": "Quiet Clicks technology with 8,000 DPI track-on-glass sensor. MagSpeed electromagnetic scrolling wheel with tactile precision and USB-C quick recharging.",
                "price": Decimal("8995.00"),
                "original_price": Decimal("10995.00"),
                "discount_percent": 18,
                "stock": 40,
                "rating": Decimal("4.7"),
                "num_reviews": 320,
                "is_featured": False,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80"
                ]
            },

            # FASHION
            {
                "cat": "fashion",
                "name": "Men's Italian Wool Slim-Fit Blazer",
                "description": "Tailored from pure virgin wool imported from Biella, Italy. Features notched lapels, pick-stitch detailing, interior chest pockets, and silk-blend interior lining.",
                "price": Decimal("8499.00"),
                "original_price": Decimal("14999.00"),
                "discount_percent": 43,
                "stock": 20,
                "rating": Decimal("4.6"),
                "num_reviews": 56,
                "is_featured": True,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "fashion",
                "name": "Women's Mulberry Silk Wrap Maxi Dress",
                "description": "Handcrafted 100% grade 6A mulberry silk with gentle flutter sleeves, self-tie sash waist, and elegant flowing A-line silhouette. Breathable luxury for evening soirees.",
                "price": Decimal("6299.00"),
                "original_price": Decimal("9999.00"),
                "discount_percent": 37,
                "stock": 22,
                "rating": Decimal("4.9"),
                "num_reviews": 78,
                "is_featured": True,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "fashion",
                "name": "Tissot Le Locle Automatic Men's Watch",
                "description": "Swiss-made automatic movement with Powermatic 80 providing an 80-hour power reserve. Scratch-resistant sapphire crystal and 316L stainless steel case with alligator-embossed leather strap.",
                "price": Decimal("48500.00"),
                "original_price": Decimal("55000.00"),
                "discount_percent": 12,
                "stock": 10,
                "rating": Decimal("4.8"),
                "num_reviews": 92,
                "is_featured": True,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "fashion",
                "name": "Handmade Full-Grain Leather Chelsea Boots",
                "description": "Goodyear welted construction with Italian vegetable-tanned calfskin. Elastic side gussets, leather pull tab, and durable Vibram rubber outsole for all-day elegance.",
                "price": Decimal("7499.00"),
                "original_price": Decimal("11999.00"),
                "discount_percent": 38,
                "stock": 14,
                "rating": Decimal("4.7"),
                "num_reviews": 64,
                "is_featured": False,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "fashion",
                "name": "Ray-Ban Classic Polarized Aviator Sunglasses",
                "description": "Gold metal frame with crystal green G-15 polarized lenses. 100% UV protection offering superior visual clarity, glare reduction, and timeless iconic fashion.",
                "price": Decimal("9290.00"),
                "original_price": Decimal("11490.00"),
                "discount_percent": 19,
                "stock": 35,
                "rating": Decimal("4.8"),
                "num_reviews": 184,
                "is_featured": False,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "fashion",
                "name": "Designer Leather Crossbody Handbag",
                "description": "Pebbled Italian leather with polished gold-tone hardware. Magnetic flap closure, adjustable strap, exterior slip pocket, and lined interior zip compartment.",
                "price": Decimal("5999.00"),
                "original_price": Decimal("8999.00"),
                "discount_percent": 33,
                "stock": 19,
                "rating": Decimal("4.7"),
                "num_reviews": 88,
                "is_featured": False,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80"
                ]
            },

            # HOME & LIVING
            {
                "cat": "home-living",
                "name": "Breville Barista Touch Espresso Machine",
                "description": "Automated touchscreen with pre-programmed cafe drinks. Integrated conical burr grinder with dose control and ThermoJet heating system reaching optimal temperature in 3 seconds.",
                "price": Decimal("79999.00"),
                "original_price": Decimal("89999.00"),
                "discount_percent": 11,
                "stock": 12,
                "rating": Decimal("4.9"),
                "num_reviews": 110,
                "is_featured": True,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "home-living",
                "name": "Scandinavian Ergonomic Lounge Chair & Ottoman",
                "description": "Molded walnut plywood shell with high-density foam cushioning wrapped in supple top-grain leather. Die-cast 5-point swivel aluminum base with 360-degree rotation.",
                "price": Decimal("28990.00"),
                "original_price": Decimal("39990.00"),
                "discount_percent": 28,
                "stock": 6,
                "rating": Decimal("4.8"),
                "num_reviews": 39,
                "is_featured": True,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "home-living",
                "name": "Dyson V12 Detect Slim Cordless Vacuum Cleaner",
                "description": "Laser reveals microscopic dust on hard floors. Piezo sensor scientifically calculates dust particles and counts them on LCD screen. Up to 60 minutes run time.",
                "price": Decimal("45900.00"),
                "original_price": Decimal("52900.00"),
                "discount_percent": 13,
                "stock": 16,
                "rating": Decimal("4.7"),
                "num_reviews": 85,
                "is_featured": False,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "home-living",
                "name": "Minimalist Matte Black Pendant Ceiling Lamp",
                "description": "Modern industrial suspension light crafted from spun iron with a powder-coated finish and brass accent collar. Adjustable braided cord suitable for high or low ceilings.",
                "price": Decimal("2499.00"),
                "original_price": Decimal("3999.00"),
                "discount_percent": 38,
                "stock": 45,
                "rating": Decimal("4.6"),
                "num_reviews": 72,
                "is_featured": False,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "home-living",
                "name": "Cast Iron Enamelled Dutch Oven (5.5 Quart)",
                "description": "Heavy-duty cast iron delivers superior heat retention and uniform distribution. Porcelain enamel interior prevents sticking and requires no seasoning. Oven safe up to 500 F.",
                "price": Decimal("4999.00"),
                "original_price": Decimal("7999.00"),
                "discount_percent": 38,
                "stock": 25,
                "rating": Decimal("4.9"),
                "num_reviews": 140,
                "is_featured": False,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "home-living",
                "name": "100% Egyptian Cotton 600-Thread Sheet Set",
                "description": "Woven from long-staple Egyptian cotton with a lustrous sateen weave. Includes 1 flat sheet, 1 deep-pocket fitted sheet (fits mattresses up to 18 inches), and 2 pillowcases.",
                "price": Decimal("3899.00"),
                "original_price": Decimal("5999.00"),
                "discount_percent": 35,
                "stock": 30,
                "rating": Decimal("4.7"),
                "num_reviews": 98,
                "is_featured": False,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&auto=format&fit=crop&q=80"
                ]
            },

            # BEAUTY
            {
                "cat": "beauty",
                "name": "Advanced Night Repair Serum (50ml)",
                "description": "Patented Chronolux Power Signal Technology repairs skin while sleeping. Infused with hyaluronic acid to lock in 72 hours of moisture and noticeably diminish fine lines.",
                "price": Decimal("6800.00"),
                "original_price": Decimal("8500.00"),
                "discount_percent": 20,
                "stock": 35,
                "rating": Decimal("4.8"),
                "num_reviews": 230,
                "is_featured": True,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "beauty",
                "name": "Tom Ford Black Orchid Eau de Parfum (100ml)",
                "description": "A luxurious and sensual fragrance of rich, dark accords and an alluring potion of black orchids and spice. Modern yet timeless flacon dressed in fluted jet-black glass.",
                "price": Decimal("18500.00"),
                "original_price": Decimal("21000.00"),
                "discount_percent": 12,
                "stock": 14,
                "rating": Decimal("4.9"),
                "num_reviews": 115,
                "is_featured": True,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "beauty",
                "name": "Dyson Supersonic Hair Dryer with Intelligent Heat Control",
                "description": "Fast drying with no extreme heat damage. Powered by Dyson V9 digital motor, includes magnetic attachments including flyaway smoother, diffuser, and styling concentrator.",
                "price": Decimal("34900.00"),
                "original_price": Decimal("39900.00"),
                "discount_percent": 13,
                "stock": 12,
                "rating": Decimal("4.8"),
                "num_reviews": 96,
                "is_featured": False,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "beauty",
                "name": "Botanical Rosewater Hydrating Face Mist (150ml)",
                "description": "100% distilled damask rosewater with aloe vera and witch hazel. Balances skin pH, restores moisture, soothes irritation, and sets makeup with a dewy glow.",
                "price": Decimal("899.00"),
                "original_price": Decimal("1499.00"),
                "discount_percent": 40,
                "stock": 60,
                "rating": Decimal("4.6"),
                "num_reviews": 145,
                "is_featured": False,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1608248597359-543596706f97?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1608248597359-543596706f97?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "beauty",
                "name": "Ceramide Barrier Strengthening Moisturizer (100ml)",
                "description": "Formulated with 5 essential ceramides, fatty acids, and squalane to repair damaged moisture barrier. Fragrance-free, paraben-free, and dermatologist tested for sensitive skin.",
                "price": Decimal("1299.00"),
                "original_price": Decimal("1799.00"),
                "discount_percent": 28,
                "stock": 48,
                "rating": Decimal("4.7"),
                "num_reviews": 160,
                "is_featured": False,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "beauty",
                "name": "Luxury Jade Roller and Gua Sha Sculpting Set",
                "description": "100% authentic natural Brazilian jade stone. Stimulates lymphatic drainage, relieves facial muscle tension, reduces puffiness, and promotes youthful radiance.",
                "price": Decimal("1199.00"),
                "original_price": Decimal("1999.00"),
                "discount_percent": 40,
                "stock": 35,
                "rating": Decimal("4.5"),
                "num_reviews": 88,
                "is_featured": False,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1512290900672-1f416d844234?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1512290900672-1f416d844234?w=800&auto=format&fit=crop&q=80"
                ]
            },

            # SPORTS
            {
                "cat": "sports",
                "name": "Nike Air Zoom Alphafly NEXT% 3 Running Shoes",
                "description": "Marathon-tested carbon-fiber propulsion with ZoomX foam and dual Air Zoom units in the forefoot. Engineered Atomknit 3.0 upper offers lightweight lockdown and breathability.",
                "price": Decimal("22795.00"),
                "original_price": Decimal("24995.00"),
                "discount_percent": 9,
                "stock": 14,
                "rating": Decimal("4.9"),
                "num_reviews": 75,
                "is_featured": True,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "sports",
                "name": "Bowflex SelectTech 552 Adjustable Dumbbells (Pair)",
                "description": "Replaces 15 sets of weights with an intuitive dial system adjusting from 5 to 52.5 lbs per dumbbell in 2.5 lb increments. Premium molded plates for smooth, quiet lifts.",
                "price": Decimal("32990.00"),
                "original_price": Decimal("44990.00"),
                "discount_percent": 27,
                "stock": 9,
                "rating": Decimal("4.8"),
                "num_reviews": 130,
                "is_featured": True,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "sports",
                "name": "Garmin Forerunner 965 GPS Smartwatch",
                "description": "Brilliant AMOLED touchscreen display with titanium bezel. Built-in full-color mapping, Training Readiness score, HRV status, and up to 23 days of battery in smartwatch mode.",
                "price": Decimal("67490.00"),
                "original_price": Decimal("72990.00"),
                "discount_percent": 8,
                "stock": 11,
                "rating": Decimal("4.9"),
                "num_reviews": 52,
                "is_featured": False,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "sports",
                "name": "Theragun PRO Plus Percussive Therapy Massager",
                "description": "Professional-grade deep muscle treatment with 16mm amplitude, optical heart rate sensor, near-infrared LED light therapy, and guided breathwork routines via Bluetooth.",
                "price": Decimal("49900.00"),
                "original_price": Decimal("59900.00"),
                "discount_percent": 17,
                "stock": 10,
                "rating": Decimal("4.8"),
                "num_reviews": 68,
                "is_featured": False,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "sports",
                "name": "Manduka PRO Yoga and Pilates Mat (6mm)",
                "description": "High-density cushion unmatched in joint protection and durability. Closed-cell surface keeps moisture and sweat from seeping into the mat. Guaranteed for life.",
                "price": Decimal("8499.00"),
                "original_price": Decimal("10999.00"),
                "discount_percent": 23,
                "stock": 25,
                "rating": Decimal("4.7"),
                "num_reviews": 94,
                "is_featured": False,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "sports",
                "name": "Hydro Flask 32 oz Wide Mouth Vacuum Bottle",
                "description": "TempShield double-wall vacuum insulation keeps drinks ice cold up to 24 hours or piping hot up to 12. Made with 18/8 pro-grade stainless steel with leakproof Flex Cap.",
                "price": Decimal("2999.00"),
                "original_price": Decimal("3999.00"),
                "discount_percent": 25,
                "stock": 50,
                "rating": Decimal("4.8"),
                "num_reviews": 210,
                "is_featured": False,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80"
                ]
            },

            # BOOKS
            {
                "cat": "books",
                "name": "Designing Data-Intensive Applications by Martin Kleppmann",
                "description": "The definitive guide to the architecture of modern data systems. Deep dive into storage engines, replication, partitioning, transactions, and distributed consensus.",
                "price": Decimal("1899.00"),
                "original_price": Decimal("2499.00"),
                "discount_percent": 24,
                "stock": 35,
                "rating": Decimal("5.0"),
                "num_reviews": 312,
                "is_featured": True,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "books",
                "name": "Atomic Habits: An Easy & Proven Way to Build Good Habits",
                "description": "James Clear reveals practical strategies on how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
                "price": Decimal("599.00"),
                "original_price": Decimal("899.00"),
                "discount_percent": 33,
                "stock": 80,
                "rating": Decimal("4.9"),
                "num_reviews": 840,
                "is_featured": True,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "books",
                "name": "The Psychology of Money by Morgan Housel",
                "description": "Timeless lessons on wealth, greed, and happiness doing well with money isn't necessarily about what you know. It's about how you behave.",
                "price": Decimal("399.00"),
                "original_price": Decimal("599.00"),
                "discount_percent": 33,
                "stock": 65,
                "rating": Decimal("4.8"),
                "num_reviews": 610,
                "is_featured": False,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "books",
                "name": "Clean Architecture: A Craftsman's Guide by Robert C. Martin",
                "description": "Practical software structure and design rules from legendary software expert Uncle Bob. Learn universal rules of software architecture for lasting success.",
                "price": Decimal("1650.00"),
                "original_price": Decimal("2200.00"),
                "discount_percent": 25,
                "stock": 28,
                "rating": Decimal("4.7"),
                "num_reviews": 195,
                "is_featured": False,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "books",
                "name": "Sapiens: A Brief History of Humankind by Yuval Noah Harari",
                "description": "A provocative and visionary narrative of how an insignificant ape became the ruler of planet Earth, capable of splitting the atom and traveling to the moon.",
                "price": Decimal("499.00"),
                "original_price": Decimal("799.00"),
                "discount_percent": 38,
                "stock": 50,
                "rating": Decimal("4.8"),
                "num_reviews": 420,
                "is_featured": False,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "books",
                "name": "Zero to One: Notes on Startups by Peter Thiel",
                "description": "How to build companies that create new things. The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create.",
                "price": Decimal("450.00"),
                "original_price": Decimal("699.00"),
                "discount_percent": 36,
                "stock": 40,
                "rating": Decimal("4.6"),
                "num_reviews": 290,
                "is_featured": False,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "electronics",
                "name": "iPad Pro 11-inch M4 Ultra Retina OLED",
                "description": "Incredibly thin design featuring the groundbreaking Ultra Retina XDR display, outrageous performance of the Apple M4 chip, and all-day battery life.",
                "price": Decimal("99900.00"),
                "original_price": Decimal("109900.00"),
                "discount_percent": 9,
                "stock": 20,
                "rating": Decimal("4.9"),
                "num_reviews": 110,
                "is_featured": True,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "fashion",
                "name": "Classic Genuine Leather Bifold Wallet",
                "description": "Handcrafted top-grain cowhide leather with RFID blocking technology, 8 card slots, and dual currency compartments.",
                "price": Decimal("1499.00"),
                "original_price": Decimal("2499.00"),
                "discount_percent": 40,
                "stock": 50,
                "rating": Decimal("4.7"),
                "num_reviews": 85,
                "is_featured": False,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "home-living",
                "name": "Aroma Essential Oil Ultrasonic Diffuser (500ml)",
                "description": "Whisper-quiet ultrasonic mist technology with 7 ambient LED colors, timer settings, and automatic shut-off safety sensor.",
                "price": Decimal("1899.00"),
                "original_price": Decimal("2999.00"),
                "discount_percent": 37,
                "stock": 35,
                "rating": Decimal("4.8"),
                "num_reviews": 140,
                "is_featured": False,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "beauty",
                "name": "Vitamin C 20% Radiance Brightening Booster (30ml)",
                "description": "Potent pure L-ascorbic acid with ferulic acid and vitamin E. Fades sun spots, evens skin tone, and restores vibrant youthful luminosity.",
                "price": Decimal("1450.00"),
                "original_price": Decimal("1999.00"),
                "discount_percent": 27,
                "stock": 45,
                "rating": Decimal("4.9"),
                "num_reviews": 190,
                "is_featured": True,
                "is_trending": False,
                "thumbnail": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "sports",
                "name": "Adjustable High-Speed Steel Cable Jump Rope",
                "description": "360-degree dual ball bearing mechanism prevents twisting. Ergonomic aluminum non-slip handles for HIIT crossfit conditioning.",
                "price": Decimal("799.00"),
                "original_price": Decimal("1299.00"),
                "discount_percent": 38,
                "stock": 60,
                "rating": Decimal("4.7"),
                "num_reviews": 115,
                "is_featured": False,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"
                ]
            },
            {
                "cat": "books",
                "name": "Thinking, Fast and Slow by Daniel Kahneman",
                "description": "Nobel laureate Daniel Kahneman takes us on a groundbreaking tour of the mind, explaining the two systems that drive the way we think and decide.",
                "price": Decimal("550.00"),
                "original_price": Decimal("799.00"),
                "discount_percent": 31,
                "stock": 55,
                "rating": Decimal("4.9"),
                "num_reviews": 530,
                "is_featured": False,
                "is_trending": True,
                "thumbnail": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
                "images": [
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80"
                ]
            }
        ]

        seeded_products = []
        for pdata in products_data:
            cat = cat_map[pdata["cat"]]
            slug = slugify(pdata["name"])
            existing = db.query(Product).filter(Product.slug == slug).first()
            if not existing:
                prod = Product(
                    category_id=cat.id,
                    name=pdata["name"],
                    slug=slug,
                    description=pdata["description"],
                    specifications="Brand: Certified Premium\nWarranty: 1 Year Manufacturer Warranty\nReturn Policy: 7 Days Replacement",
                    price=pdata["price"],
                    original_price=pdata["original_price"],
                    discount_percent=pdata["discount_percent"],
                    stock=pdata["stock"],
                    rating=pdata["rating"],
                    num_reviews=pdata["num_reviews"],
                    is_featured=pdata["is_featured"],
                    is_trending=pdata["is_trending"],
                    is_active=True,
                    thumbnail=pdata["thumbnail"]
                )
                db.add(prod)
                db.flush()

                for i, img in enumerate(pdata["images"]):
                    db.add(ProductImage(
                        product_id=prod.id,
                        image_url=img,
                        is_primary=(i == 0)
                    ))
                seeded_products.append(prod)
            else:
                seeded_products.append(existing)

        db.commit()
        print(f"Products verified/seeded ({len(seeded_products)} products).")

        # 5. Sample Reviews
        sample_prod = seeded_products[0]
        rev = db.query(Review).filter(Review.product_id == sample_prod.id, Review.user_id == customer.id).first()
        if not rev:
            rev = Review(
                product_id=sample_prod.id,
                user_id=customer.id,
                rating=5,
                title="Exceptional quality and comfort!",
                comment="The noise cancellation is truly astonishing. Battery lasts throughout my workday and commutes. Highly recommended!"
            )
            db.add(rev)

        # 6. Sample Initial Order for customer to populate Order History & Admin stats
        existing_order = db.query(Order).filter(Order.user_id == customer.id).first()
        if not existing_order:
            import json
            sample_order_number = generate_order_number()
            p1 = seeded_products[0]
            p2 = seeded_products[7]
            sub = p1.price + p2.price
            disc = (p1.original_price - p1.price) + (p2.original_price - p2.price)
            deliv = Decimal("0.00")
            tot = sub + deliv

            order = Order(
                order_number=sample_order_number,
                user_id=customer.id,
                address_id=cust_addr.id,
                status="Delivered",
                subtotal=sub,
                discount_amount=disc,
                delivery_charge=deliv,
                total_amount=tot,
                payment_method="card",
                payment_status="completed",
                shipping_address_snapshot=json.dumps({
                    "full_name": cust_addr.full_name,
                    "phone_number": cust_addr.phone_number,
                    "address_line1": cust_addr.address_line1,
                    "city": cust_addr.city,
                    "state": cust_addr.state,
                    "postal_code": cust_addr.postal_code,
                    "country": cust_addr.country
                })
            )
            db.add(order)
            db.flush()

            db.add(OrderItem(
                order_id=order.id,
                product_id=p1.id,
                product_name=p1.name,
                product_image=p1.thumbnail,
                price=p1.price,
                original_price=p1.original_price,
                quantity=1,
                total_price=p1.price
            ))
            db.add(OrderItem(
                order_id=order.id,
                product_id=p2.id,
                product_name=p2.name,
                product_image=p2.thumbnail,
                price=p2.price,
                original_price=p2.original_price,
                quantity=1,
                total_price=p2.price
            ))

            db.add(Payment(
                order_id=order.id,
                user_id=customer.id,
                payment_method="card",
                transaction_id=generate_transaction_id("PAY"),
                amount=tot,
                status="completed",
                gateway_response=json.dumps({"verified": True, "mode": "demo"})
            ))
            db.commit()
            print(f"Created demo delivered order: {order.order_number}")

        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

