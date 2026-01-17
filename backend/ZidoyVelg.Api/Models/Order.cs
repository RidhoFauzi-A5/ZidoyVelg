using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ZidoyVelg.Api.Models;

[BsonIgnoreExtraElements]
public class Order
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? UserId { get; set; }

    [BsonElement("customerName")]
    public string? CustomerName { get; set; }

    [BsonElement("customerPhone")]
    public string? CustomerPhone { get; set; }

    [BsonElement("shippingAddress")]
    public string? ShippingAddress { get; set; }

    [BsonElement("paymentMethod")]
    public string? PaymentMethod { get; set; }

    [BsonElement("paymentProofUrl")]
    public string? PaymentProofUrl { get; set; }
    
    [BsonIgnore]
    public IFormFile? PaymentProofImage { get; set; }

    [BsonElement("items")]
    public List<OrderItem> Items { get; set; } = new();

    [BsonElement("totalAmount")]
    public decimal TotalAmount { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = "Pending"; 

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class OrderItem
{
    [BsonElement("productId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string ProductId { get; set; } = null!;

    [BsonElement("productName")]
    public string ProductName { get; set; } = null!;

    [BsonElement("variantSpec")]
    public string VariantSpec { get; set; } = null!;

    [BsonElement("color")]
    public string Color { get; set; } = null!;

    [BsonElement("price")]
    public decimal Price { get; set; }

    [BsonElement("quantity")]
    public int Quantity { get; set; }
}
