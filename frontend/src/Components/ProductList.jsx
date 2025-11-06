import { StarIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import ProductQuickView from './ProductQuickView'
import { useNavigate } from 'react-router-dom'
import { useProducts } from '../Contexts/productContext'
import Spinner from './Spinner'


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function ProductList() {
  const {products,setCart,isLoadingProducts,productsError} = useProducts()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
 
  const handleQuickView = (product) => {
    setSelectedProduct(product)
    setOpen(true)
  }
    if (isLoadingProducts) return <Spinner/>;
    if (productsError) return <p>There was an error fetching products data</p>;
  


  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl overflow-hidden sm:px-6 lg:px-8">
        <h2 className="sr-only">Products</h2>

        <div className="-mx-px grid grid-cols-2 border-l border-gray-200 sm:mx-0 md:grid-cols-3 lg:grid-cols-4">
          {products?.map((product) => (
            <div
              key={product.id}
              onClick={() => {
              
                if(product) navigate('/product-details',{state : {product}})
              }}
            
              className="group relative border-r border-b border-gray-200 p-4 sm:p-6"
            >
              <img
                alt={product.imageAlt}
                src={product.imageSrc}
                className="aspect-square rounded-lg bg-gray-200 object-contain group-hover:opacity-75 transition duration-150"
              />

              <button
  onClick={(e) => {
    e.stopPropagation(); 
    handleQuickView(product);
  }}
  className="mt-3 w-3/4 rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
>
  Quick View
</button>

              <div className="pt-10 pb-4 text-left">
                <h3 className="text-sm font-medium text-gray-900">
                  <p className='relative'>{product.name}</p>
                  
                </h3>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIcon
                        key={rating}
                        aria-hidden="true"
                        className={classNames(
                          product.rating > rating ? 'text-yellow-400' : 'text-gray-200',
                          'size-5 shrink-0',
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 font-bold">
                    {product.rating.toFixed(1)}
                  </p>
                </div>

                <p className="mt-4 text-base font-medium text-gray-900">
                  {product.quantityLabel}
                </p>
                <p className="mt-1 text-base font-medium text-gray-900">
                  Ksh {product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    
      {open && (
        <ProductQuickView
          open={open}
          setOpen={setOpen}
          product={selectedProduct}
         
          setCart={setCart}
        />
      )}
    </div>
  )
}
