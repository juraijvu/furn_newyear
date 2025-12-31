export interface ColorItem {
  id: string;
  code: string;
  name: string;
  hexColor: string;
}

export interface ColorCategory {
  id: string;
  name: string;
  colors: ColorItem[];
}

export const colorPalette: ColorCategory[] = [
  {
    id: "stainless-steel",
    name: "Stainless Steel Finishing",
    colors: [
      { id: "ss02", code: "SS02", name: "Hairline S/S", hexColor: "#C0C0C0" },
      { id: "ss03", code: "SS03", name: "Rose Gold Plating", hexColor: "#B76E79" },
      { id: "ss04", code: "SS04", name: "Black Plating", hexColor: "#2C2C2C" },
      { id: "ss11", code: "SS11", name: "Brown Plating", hexColor: "#6B4423" },
      { id: "ss13", code: "SS13", name: "Champagne Plating", hexColor: "#F7E7CE" },
      { id: "ss25", code: "SS25", name: "Gold Bronze Plating", hexColor: "#CD7F32" },
    ]
  },
  {
    id: "steel-aluminum-a",
    name: "Steel & Aluminum Options A",
    colors: [
      { id: "pc1", code: "PC1", name: "White", hexColor: "#F5F5F5" },
      { id: "pc2", code: "PC2", name: "Gold", hexColor: "#FFD700" },
      { id: "pc3", code: "PC3", name: "Silver", hexColor: "#C0C0C0" },
      { id: "pc4", code: "PC4", name: "Brown & Gold", hexColor: "#8B6914" },
      { id: "pc5", code: "PC5", name: "Champagne", hexColor: "#F7E7CE" },
      { id: "pc6", code: "PC6", name: "Crack Black", hexColor: "#1A1A1A" },
    ]
  },
  {
    id: "steel-aluminum-b",
    name: "Steel & Aluminum Options B",
    colors: [
      { id: "pc7", code: "PC7", name: "Matt Black", hexColor: "#28282B" },
      { id: "pc8", code: "PC8", name: "Coffee", hexColor: "#6F4E37" },
    ]
  },
  {
    id: "wooden-finishing",
    name: "Wooden Finishing",
    colors: [
      { id: "sq1", code: "SQ1", name: "Black Walnut", hexColor: "#3A2F2F" },
      { id: "sq2", code: "SQ2", name: "Philippine Willow", hexColor: "#D4A574" },
      { id: "sq3", code: "SQ3", name: "Classic Teak", hexColor: "#B8860B" },
      { id: "sq4", code: "SQ4B", name: "Orchard Oak", hexColor: "#C19A6B" },
      { id: "sq5", code: "SQ5", name: "Classic Walnut", hexColor: "#5C4033" },
      { id: "sq6", code: "SQ6", name: "Warm White Pine", hexColor: "#F5DEB3" },
    ]
  },
  {
    id: "hpl-wooden",
    name: "HPL Laminate - Wooden Pattern",
    colors: [
      { id: "t1", code: "D", name: "Earth Cedar", hexColor: "#8B7355" },
      { id: "t2", code: "D", name: "Aged Alameda", hexColor: "#A0826D" },
      { id: "t3", code: "NT", name: "Olive Wood", hexColor: "#6B5D4F" },
      { id: "t4", code: "NT", name: "Etremal Cedar", hexColor: "#B88A68" },
      { id: "t5", code: "T4211XT", name: "Ocean Vogue Wood", hexColor: "#5D4E37" },
      { id: "t6", code: "", name: "Alice Walnut", hexColor: "#664229" },
      { id: "t7", code: "", name: "Carbon Ash", hexColor: "#3E3E3E" },
      { id: "t8", code: "T", name: "Raw Oak", hexColor: "#B5A586" },
      { id: "t9", code: "", name: "Legno Silver Oak", hexColor: "#9B8B7E" },
      { id: "t10", code: "", name: "Natural Maple", hexColor: "#E3CDA4" },
      { id: "t11", code: "EB", name: "Driftage", hexColor: "#8B7D6B" },
      { id: "t12", code: "NT", name: "Ivory Elm", hexColor: "#F5E6D3" },
      { id: "t13", code: "GNT", name: "Dwan Oak", hexColor: "#C4A57B" },
      { id: "t14", code: "T", name: "Costa Nogal", hexColor: "#6F5843" },
      { id: "t15", code: "CK", name: "Ash Washing Maple", hexColor: "#D8CFC4" },
      { id: "t16", code: "NT", name: "Vosges Teak", hexColor: "#A0826D" },
      { id: "t17", code: "D", name: "Blacken Legno", hexColor: "#2F2F2F" },
      { id: "t18", code: "T5243", name: "Classic Walnut", hexColor: "#5C4033" },
    ]
  },
  {
    id: "hpl-stone",
    name: "HPL Laminate - Stone Pattern",
    colors: [
      { id: "st1", code: "MBH", name: "Rust", hexColor: "#A0522D" },
      { id: "st2", code: "ST", name: "Coffee Ice Cream", hexColor: "#C4A57B" },
      { id: "st3", code: "ST", name: "Black Matt Slate", hexColor: "#36454F" },
      { id: "st4", code: "CD", name: "Marble", hexColor: "#E8E8E8" },
      { id: "st5", code: "ST", name: "Red Rust Stone", hexColor: "#8B4513" },
      { id: "st6", code: "MBH", name: "Ash Cement", hexColor: "#A9A9A9" },
      { id: "st7", code: "CD", name: "Lotana", hexColor: "#D3D3D3" },
      { id: "st8", code: "DCK", name: "Natural Stone", hexColor: "#BDB5A7" },
      { id: "st9", code: "T1332", name: "Goyo Ramblas", hexColor: "#8B7D6B" },
    ]
  },
  {
    id: "nano-micro",
    name: "Nano Microcrystalline Pattern",
    colors: [
      { id: "gx1", code: "GKL", name: "Elegant Yellow", hexColor: "#F4E4C1" },
      { id: "gx2", code: "GTL", name: "Grey & White Marble", hexColor: "#D3D3D3" },
      { id: "gx3", code: "GTL", name: "Retro Grey", hexColor: "#808080" },
      { id: "gx4", code: "GTL", name: "Light Grey", hexColor: "#C0C0C0" },
      { id: "gx5", code: "GTL", name: "Dark Grey", hexColor: "#696969" },
      { id: "gx6", code: "GTL", name: "Coffee Marble", hexColor: "#8B7355" },
    ]
  }
];
