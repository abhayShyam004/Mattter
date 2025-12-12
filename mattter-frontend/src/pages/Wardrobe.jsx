import React from 'react';

const Wardrobe = () => {
    // Mock wardrobe items
    const items = [
        { id: 1, name: "Blue Silk Shirt", category: "Top", image: "https://placehold.co/300x400/png?text=Shirt" },
        { id: 2, name: "Black Denim Jeans", category: "Bottom", image: "https://placehold.co/300x400/png?text=Jeans" },
        { id: 3, name: "Leather Boots", category: "Shoes", image: "https://placehold.co/300x400/png?text=Boots" },
        { id: 4, name: "Wool Scarf", category: "Accessory", image: "https://placehold.co/300x400/png?text=Scarf" },
        { id: 5, name: "White Tee", category: "Top", image: "https://placehold.co/300x400/png?text=Tee" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Virtual Wardrobe</h1>
                <button className="bg-accent text-white px-4 py-2 rounded hover:bg-yellow-600 transition">
                    + Upload Item
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                {['All', 'Tops', 'Bottoms', 'Shoes', 'Accessories'].map(filter => (
                    <button key={filter} className="px-4 py-1 rounded-full border border-gray-300 hover:bg-gray-100 text-sm whitespace-nowrap">
                        {filter}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map(item => (
                    <div key={item.id} className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                        <div className="aspect-[3/4] bg-gray-100 relative">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <button className="bg-white text-primary px-4 py-2 rounded-full text-sm font-medium">View Details</button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-medium truncate">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wardrobe;
