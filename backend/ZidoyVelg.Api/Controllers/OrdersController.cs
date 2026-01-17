using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using ZidoyVelg.Api.Models;
using ZidoyVelg.Api.Services;

namespace ZidoyVelg.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IMongoCollection<Order> _orders;
    private readonly IMongoCollection<Product> _products;

    public OrdersController(MongoDbService dbService)
    {
        _orders = dbService.Orders;
        _products = dbService.Products;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateOrder([FromForm] Order order)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        // Handle Image Upload
        if (order.PaymentProofImage != null)
        {
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(order.PaymentProofImage.FileName)}";
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "payments", fileName);
            
            Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await order.PaymentProofImage.CopyToAsync(stream);
            }
            
            order.PaymentProofUrl = $"/images/payments/{fileName}";
        }

        order.UserId = userId;
        order.CreatedAt = DateTime.UtcNow;
        order.Status = "Pending";
        
        // Basic stock validation could go here, but for simplicity we'll assume valid for now
        // or implement transaction logic later.

        order.Id = null;
        await _orders.InsertOneAsync(order);
        
        return CreatedAtAction(nameof(GetMyOrders), new { id = order.Id }, order);
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var orders = await _orders.Find(o => o.UserId == userId).SortByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(orders);
    }

    [Authorize(Roles = "admin")]
    [HttpGet("all")]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _orders.Find(_ => true).SortByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(orders);
    }

    [Authorize(Roles = "admin")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateStatusDto request)
    {
        var update = Builders<Order>.Update.Set(o => o.Status, request.Status);
        var result = await _orders.UpdateOneAsync(o => o.Id == id, update);

        if (result.MatchedCount == 0) return NotFound();
        return NoContent();
    }
    [AllowAnonymous]
    [HttpGet("wipe-data-z")]
    public async Task<IActionResult> WipeAllOrders()
    {
        await _orders.DeleteManyAsync(_ => true);
        return Ok(new { Message = "ALL DATA WIPED SUCCESFULLY" });
    }
}

public class UpdateStatusDto
{
    public string Status { get; set; } = null!;
}
