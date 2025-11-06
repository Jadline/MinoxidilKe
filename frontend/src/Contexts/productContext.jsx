import { useContext } from "react";
import { createContext } from "react";
import { useState, useEffect } from "react";

import { buildQuery } from "../helpers/buildquery";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../Services/fetchproducts";
import { getOrders } from "../Services/fetchOrders";
import { jwtDecode } from "jwt-decode";

const productsContext = createContext();

function ProductsProvider({ children }) {
  
  const itemsperPage = 6;

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (err) {
      console.log("Error parsing cart data from localStorage", err);
      return [];
    }
  });

 


  const[currentUser,setCurrentUser] = useState(null)
 useEffect(() => {
  const token = localStorage.getItem("userToken");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      setCurrentUser({
        id: decoded.id,
        email: decoded.email,
        name: decoded.name, 
      });
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("userToken");
    }
  }
}, []);


  const [shippingCost, setShippingCost] = useState();
  const [selectedCity, setSelectedCity] = useState(
    () => localStorage.getItem("selectedCity") || ""
  );
  
  const [selectedFilters, setSelectedFilters] = useState({
    price: [],
    category: [],
  });
  const[currentPage,setCurrentPage] = useState(1)
  const[totalPages,setTotalPages] = useState(3)
 
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  
  //     async function fetchProducts() {
  //       try {
  //         const res = await fetch("./data/productdata.json");
  //         const data = await res.json();
  //         console.log(data.products);
  //         setProducts(data.products);
  //       } catch (err) {
  //         console.log("There was an error fetching data", err);
  //       }
  //     }
  //     fetchProducts();
  //   }, []);

  const cartCount = cart?.reduce((count, cartitem) => {
    return count + cartitem.quantity;
  }, 0);
  const [sortBy, setsortBy] = useState("name-asc");

  const Total = cart.reduce((acc, curItem) => {
    const totalcost = curItem.price * curItem.quantity;
    const subtotal = acc + totalcost;
    return subtotal;
  }, 0);
  const OrderTotal = shippingCost + Total;

  const{data:orders,isLoading:isLoadingOrders,error:ordersError} = useQuery({
    queryKey : ['orders'],
    queryFn : getOrders,
    keepPreviousData : true
  })

 

 const qs =  buildQuery({selectedFilters,sortBy,currentPage,itemsperPage})

 const {data,isLoading :isLoadingProducts,error : productsError} = useQuery({
        queryKey : ['shopProducts',qs],
        queryFn : () => fetchProducts(qs),
        keepPreviousData: true
 })
 const products = data?.products || []
 const totalItems = data?.total || 0
console.log('cart',cart)
console.log('orders',orders) 
console.log('currentUser',currentUser)
  return (
    <productsContext.Provider
      value={{
        products,
        cart,
        setCart,
        shippingCost,
        setShippingCost,
        selectedCity,
        setSelectedCity,
        orders,
     
        cartCount,
        Total,
        OrderTotal,
        selectedFilters,
        setSelectedFilters,
        sortBy,
        setsortBy,
        currentPage,
        setCurrentPage,
        totalPages,
        setTotalPages,
        itemsperPage,
        isLoadingProducts,
        productsError,
        totalItems,
        isLoadingOrders,
        ordersError,
        currentUser,
        setCurrentUser
      }}
    >
      {children}
    </productsContext.Provider>
  );
}
function useProducts() {
  const context = useContext(productsContext);
  if (context === undefined)
    throw new Error("useProducts must be used within a ProductsProvider");
  return context;
}

export { ProductsProvider, useProducts };
