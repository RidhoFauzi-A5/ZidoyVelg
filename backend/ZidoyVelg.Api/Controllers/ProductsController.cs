using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using ZidoyVelg.Api.Models;
using ZidoyVelg.Api.Services;

namespace ZidoyVelg.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly MongoDbService _mongoDbService;
    private readonly IMongoCollection<Product> _productsCollection;
    private readonly IWebHostEnvironment _environment;

    public ProductsController(MongoDbService mongoDbService, IWebHostEnvironment environment)
    {
        _mongoDbService = mongoDbService;
        _productsCollection = _mongoDbService.Products;
        _environment = environment;
    }

    [HttpGet]
    public async Task<List<Product>> Get()
    {
        if (_productsCollection == null) return new List<Product>();
        return await _productsCollection.Find(_ => true).ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> Get(string id)
    {
        if (_productsCollection == null) return NotFound();
        var product = await _productsCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (product == null) return NotFound();
        return product;
    }

    [Authorize(Roles = "admin")]
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<Product>> Create([FromForm] ProductCreateDto request)
    {
        if (_productsCollection == null) return StatusCode(500, "Database not connected");

        string imageUrl = "";
        if (request.Image != null)
        {
            var uploads = Path.Combine(_environment.WebRootPath, "images/products");
            if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);
            
            var uniqueFileName = Guid.NewGuid().ToString() + "_" + request.Image.FileName;
            var filePath = Path.Combine(uploads, uniqueFileName);
            
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await request.Image.CopyToAsync(fileStream);
            }
            imageUrl = "/images/products/" + uniqueFileName;
        }

        var product = new Product
        {
            Name = request.Name,
            Brand = request.Brand,
            Category = request.Category,
            Description = request.Description,
            ImageUrl = imageUrl,
            // Simplified variant logic for now - sticking to the simple inputs from frontend
            Stock = request.Stock,
            Price = request.Price,
            Color = request.Color,
            Spec = request.Spec
        };

        await _productsCollection.InsertOneAsync(product);
        return CreatedAtAction(nameof(Get), new { id = product.Id }, product);
    }

    [Authorize(Roles = "admin")]
    [HttpPut("{id}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(string id, [FromForm] ProductCreateDto request)
    {
         if (_productsCollection == null) return StatusCode(500, "Database not connected");
        var existingProduct = await _productsCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (existingProduct == null) return NotFound();

        if (request.Image != null)
        {
             var uploads = Path.Combine(_environment.WebRootPath, "images/products");
             if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);

             var uniqueFileName = Guid.NewGuid().ToString() + "_" + request.Image.FileName;
             var filePath = Path.Combine(uploads, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await request.Image.CopyToAsync(fileStream);
            }
            existingProduct.ImageUrl = "/images/products/" + uniqueFileName;
        }
        else if (!string.IsNullOrEmpty(request.ImageUrl)) {
             // If imageUrl is passed as text (e.g. keeping existing) - though ForForm usually handles files
             // Typically we assume if Image is null, we keep existing unless explicit clear logic exists
        }

        existingProduct.Name = request.Name;
        existingProduct.Brand = request.Brand;
        existingProduct.Category = request.Category;
        existingProduct.Description = request.Description;
        existingProduct.Stock = request.Stock;
        existingProduct.Price = request.Price;
        existingProduct.Color = request.Color;
        existingProduct.Spec = request.Spec;

        await _productsCollection.ReplaceOneAsync(p => p.Id == id, existingProduct);
        return NoContent();
    }

    [Authorize(Roles = "admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
         if (_productsCollection == null) return StatusCode(500, "Database not connected");
        var result = await _productsCollection.DeleteOneAsync(p => p.Id == id);
        if (result.DeletedCount == 0) return NotFound();
        return NoContent();
    }
}

public class ProductCreateDto
{
    public string Name { get; set; } = null!;
    public string Brand { get; set; } = null!;
    public string Category { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int Stock { get; set; }
    public decimal Price { get; set; }
    public string? Color { get; set; }
    public string? Spec { get; set; }
    public IFormFile? Image { get; set; }
    public string? ImageUrl { get; set; } // For keeping existing URL
}
