using Microsoft.Extensions.Options;
using MongoDB.Driver;
using ZidoyVelg.Api.Models;

namespace ZidoyVelg.Api.Services;

public class ZidoyVelgDatabaseSettings
{
    public string ConnectionString { get; set; } = null!;
    public string DatabaseName { get; set; } = null!;
    public string ProductsCollectionName { get; set; } = null!;
    public string UsersCollectionName { get; set; } = null!;
    public string OrdersCollectionName { get; set; } = null!;
}

public class MongoDbService
{
    private readonly IMongoDatabase _database;
    private readonly ZidoyVelgDatabaseSettings _settings;

    public MongoDbService(IOptions<ZidoyVelgDatabaseSettings> settings)
    {
        _settings = settings.Value;
        var client = new MongoClient(_settings.ConnectionString);
        _database = client.GetDatabase(_settings.DatabaseName);
    }

    public IMongoCollection<Product> Products => _database.GetCollection<Product>(_settings.ProductsCollectionName);
    public IMongoCollection<User> Users => _database.GetCollection<User>(_settings.UsersCollectionName);
    public IMongoCollection<Order> Orders => _database.GetCollection<Order>(_settings.OrdersCollectionName);
}
