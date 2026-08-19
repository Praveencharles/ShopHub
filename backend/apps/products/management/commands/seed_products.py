import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.products.models import Brand, Category, Product, ProductImage


class Command(BaseCommand):
    help = "Seed the catalog with 10 categories, 5 brands per category and 10 products per brand (500 products)."

    # 10 categories -> each with 5 brands and 10 products
    CATALOG = {
        "Electronics": {
            "price_range": (999, 89999),
            "brands": ["VoltEdge", "NovaTech", "PulseCore", "Skyline Digital", "Orbitron"],
            "products": [
                "Smartphone", "Wireless Earbuds", "Smartwatch", "Bluetooth Speaker",
                "Laptop", "LED Monitor", "Mechanical Keyboard", "Wireless Mouse",
                "Power Bank", "Noise Cancelling Headphones",
            ],
        },
        "Fashion": {
            "price_range": (299, 14999),
            "brands": ["Urban Threads", "Zaraa Vogue", "Trendora", "Classico", "Vogue Street"],
            "products": [
                "Men's Casual Shirt", "Women's Kurti", "Denim Jeans", "Sneakers",
                "Leather Belt", "Rayon Saree", "Formal Blazer", "Cotton T-Shirt",
                "Sunglasses", "Canvas Backpack",
            ],
        },
        "Home & Kitchen": {
            "price_range": (199, 24999),
            "brands": ["HomeCraft", "CookEase", "Nestora", "KitchenPro", "Decoriva"],
            "products": [
                "Non-Stick Cookware Set", "Air Fryer", "Mixer Grinder", "Coffee Maker",
                "Induction Cooktop", "Vacuum Cleaner", "Water Purifier", "Storage Containers",
                "Bed Sheet Set", "Table Lamp",
            ],
        },
        "Beauty & Personal Care": {
            "price_range": (99, 5999),
            "brands": ["GlowVerse", "Lumina Beauty", "SkinNaturals", "Aura Cosmetics", "VelvetCare"],
            "products": [
                "Vitamin C Face Serum", "Hair Dryer", "Face Cleanser", "Sunscreen SPF 50",
                "Lipstick Set", "Perfume", "Shampoo", "Face Moisturizer",
                "Body Lotion", "Electric Trimmer",
            ],
        },
        "Sports & Fitness": {
            "price_range": (199, 29999),
            "brands": ["FitPulse", "IronClad Sports", "AeroFit", "TrailBlaze", "PowerFlex"],
            "products": [
                "Adjustable Dumbbells", "Yoga Mat", "Treadmill", "Resistance Bands",
                "Cycling Helmet", "Dumbbell Set", "Running Shoes", "Protein Shaker",
                "Skipping Rope", "Home Gym Bench",
            ],
        },
        "Books & Stationery": {
            "price_range": (49, 2999),
            "brands": ["PageTurner", "InkWell", "QuillHouse", "PaperNest", "WordCraft"],
            "products": [
                "Fiction Novel", "Notebook Set", "Gel Pen Pack", "Watercolor Kit",
                "Desk Organizer", "Self-Help Book", "Sketchbook", "Scientific Calculator",
                "Sticky Notes Set", "Board Game",
            ],
        },
        "Toys & Games": {
            "price_range": (99, 9999),
            "brands": ["PlayNest", "ToyRocket", "BrainBuilders", "FunSpark", "MiniMinds"],
            "products": [
                "Building Blocks", "Remote Control Car", "Puzzle Set", "Action Figure",
                "Board Game", "Plush Teddy Bear", "RC Drone", "Educational Robot",
                "Toy Train Set", "Art & Craft Kit",
            ],
        },
        "Automotive": {
            "price_range": (149, 24999),
            "brands": ["RoadMaster", "AutoZone Pro", "DrivePro", "GarageGear", "MotoMax"],
            "products": [
                "Car Seat Cover Set", "Dash Cam", "Floor Mats", "Car Vacuum Cleaner",
                "Portable Tyre Inflator", "LED Headlight Kit", "Car Cleaning Kit",
                "Bluetooth Car Adapter", "Roof Cargo Box", "Side Mirror Covers",
            ],
        },
        "Grocery & Gourmet": {
            "price_range": (49, 4999),
            "brands": ["FreshBasket", "HarvestGold", "TastyTrails", "PureNest", "GreenValley"],
            "products": [
                "Organic Basmati Rice", "Cold Pressed Oil", "Premium Green Tea", "Honey Jar",
                "Coffee Beans", "Dry Fruits Mix", "Dark Chocolate", "Baking Flour",
                "Spice Gift Pack", "Instant Breakfast Mix",
            ],
        },
        "Health & Wellness": {
            "price_range": (99, 12999),
            "brands": ["VitalPlus", "NutriCore", "HealthBridge", "PureLife", "WellBeing"],
            "products": [
                "Digital Blood Pressure Monitor", "Vitamin D3 Supplements", "Steam Inhaler",
                "Electric Massager", "Posture Corrector", "Body Weight Scale",
                "First Aid Kit", "Omega-3 Capsules", "Heated Neck Wrap", "Air Purifier Mini",
            ],
        },
    }

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Clearing existing catalog data...")
        Product.objects.all().delete()
        Brand.objects.all().delete()
        Category.objects.all().delete()

        rng = random.Random(2026)

        category_count = 0
        brand_count = 0
        product_count = 0

        for cat_name, config in self.CATALOG.items():
            category = Category.objects.create(
                name=cat_name,
                slug=slugify(cat_name),
                description=f"Premium {cat_name.lower()} collection curated for the best quality and value.",
                is_active=True,
            )
            category_count += 1

            min_price, max_price = config["price_range"]

            for brand_name in config["brands"]:
                brand = Brand.objects.create(
                    name=brand_name,
                    slug=slugify(brand_name),
                    description=f"{brand_name} - trusted {cat_name.lower()} brand.",
                    is_active=True,
                )
                brand_count += 1

                for idx, product_name in enumerate(config["products"], start=1):
                    price = Decimal(rng.randint(min_price, max_price))
                    has_discount = rng.random() < 0.45
                    discount_price = None
                    if has_discount:
                        discount_price = round(price * Decimal(rng.uniform(0.60, 0.92)), 2)

                    stock = rng.randint(20, 200)
                    product = Product.objects.create(
                        name=f"{brand_name} {product_name}",
                        slug=slugify(f"{brand_name} {product_name} {idx}"),
                        description=(
                            f"The {brand_name} {product_name} is crafted with premium materials "
                            f"and built to last. Experience the best of {category.name.lower()} "
                            f"with this top-rated product loved by thousands of customers."
                        ),
                        short_description=f"{brand_name} {product_name} - {category.name} essentials.",
                        price=price,
                        discount_price=discount_price,
                        category=category,
                        brand=brand,
                        sku=f"{slugify(cat_name)[:3].upper()}-{slugify(brand_name)[:3].upper()}-{idx:03d}",
                        stock_quantity=stock,
                        low_stock_threshold=5,
                        status=Product.Status.ACTIVE,
                        is_featured=rng.random() < 0.08,
                        is_new_arrival=rng.random() < 0.12,
                        weight=Decimal(rng.uniform(0.2, 15)).quantize(Decimal("0.01")),
                        dimensions=f"{rng.randint(5, 60)} x {rng.randint(5, 60)} x {rng.randint(2, 30)} cm",
                        tags=f"{slugify(cat_name)},{slugify(brand_name)},{product_name.lower().replace(' ', '-')}",
                        sales_count=rng.randint(0, 400),
                    )
                    product_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Seed complete: {category_count} categories, {brand_count} brands, {product_count} products."
        ))
