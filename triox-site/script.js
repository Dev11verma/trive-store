const products=[
{name:"Lost But Never Broken Tee",color:"Black",price:1299,tag:"Oversized Tee"},
{name:"Lost But Never Broken Tee",color:"Off-White",price:1299,tag:"Oversized Tee"},
{name:"Compass Boxy Sweatshirt",color:"Charcoal",price:1799,tag:"Boxy Fit"},
{name:"Northbound Heavyweight Hoodie",color:"Black",price:2399,tag:"Premium Hoodie"},
{name:"TRIOX Compass Cap",color:"Black",price:699,tag:"Accessory"}
];
document.getElementById("products").innerHTML=products.map(p=>`
<article class="card">
<div class="thumb">TRIOX</div>
<div class="card-body">
<p class="tag">${p.tag}</p>
<h3>${p.name}</h3>
<p>${p.color}</p>
<p class="price">₹${p.price.toLocaleString("en-IN")}</p>
</div></article>`).join("");
document.getElementById("year").textContent=new Date().getFullYear();
document.getElementById("subscribe").addEventListener("submit",e=>{e.preventDefault();document.getElementById("form-msg").textContent="You are on the TRIOX list. Drop updates incoming.";e.target.reset();});