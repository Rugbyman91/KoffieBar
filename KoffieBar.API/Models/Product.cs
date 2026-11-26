namespace KoffieBar.API.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Allergies { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public Categorie Categorie { get; set; }
        public bool IsEspresso { get; set; }
    }
}