using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ZidoyVelg.Api.Models;

public class Product
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string Name { get; set; } = null!;

    [BsonElement("brand")]
    public string Brand { get; set; } = null!;

    [BsonElement("category")]
    public string Category { get; set; } = null!;

    [BsonElement("description")]
    public string Description { get; set; } = null!;

    [BsonElement("imageUrl")]
    public string ImageUrl { get; set; } = null!;

    [BsonElement("color")]
    public string? Color { get; set; }

    [BsonElement("spec")]
    public string? Spec { get; set; }

    // Simplified properties for single-variant products
    [BsonElement("stock")]
    public int Stock { get; set; }

    [BsonElement("price")]
    public decimal Price { get; set; }

    [BsonElement("variants")]
    public List<ProductVariant> Variants { get; set; } = new();
}

public class ProductVariant
{
    [BsonElement("spec")]
    public string Spec { get; set; } = null!; // e.g., "R15 4x100 7J"

    [BsonElement("price")]
    public decimal Price { get; set; }

    [BsonElement("stock")]
    public int Stock { get; set; }

    [BsonElement("color")]
    public string Color { get; set; } = null!;
}
