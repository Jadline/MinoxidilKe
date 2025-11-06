import { useForm } from "react-hook-form"
import { sendEmail } from "../Services/sendEmail"
import {useMutation} from '@tanstack/react-query'
import toast from "react-hot-toast"

export default function ContactInfo() {

  const{mutate:mutateFormdata} = useMutation({
    mutationFn : (data) => sendEmail(data),
    onSuccess : () => {
      toast.success('Email was sent successfully')
    

    }
    
  })

  const{register,formState,reset,handleSubmit} = useForm()
  const{errors} = formState

  function onhandleContactinfo(data){
    console.log('formdata',data)
    mutateFormdata(data)
    reset()

  }
  return (
    <div className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8 text-gray-900">
      <div className="mx-auto max-w-xl lg:max-w-4xl">
        <h2 className="text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl ">
          Order Your  Hair Transformation  Products Today
        </h2>
        <p className="mt-2 text-lg/8 text-gray-600">
          Whether you’re looking for a fresh haircut, color treatment, or hair restoration service — we’re here to bring
          your confidence back to life.
        </p>

        <div className="mt-16 flex flex-col gap-16 sm:gap-y-20 lg:flex-row">
      
          <form 
          action="#" 
          method="POST" 
          className="lg:flex-auto"
          onSubmit={handleSubmit(onhandleContactinfo)}
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
              <div>
                <label htmlFor="first-name" className="block text-sm font-semibold text-gray-900">
                  First name
                </label>
                <div className="mt-2.5">
                  <input
                    id="first-name"
                    name="first-name"
                    type="text"
                    autoComplete="given-name"
                    {...register('firstName',{required : 'This field is required'})}
                    className="block w-full rounded-md border border-gray-300 px-3.5 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {errors.firstName && <p className='text-red-400'>{errors.firstName.message}</p>}
              </div>

              <div>
                <label htmlFor="last-name" className="block text-sm font-semibold text-gray-900">
                  Last name
                </label>
                <div className="mt-2.5">
                  <input
                    id="last-name"
                    name="last-name"
                    type="text"
                    autoComplete="family-name"
                    {...register('lastName',{required : 'This field is required'})}
                    className="block w-full rounded-md border border-gray-300 px-3.5 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {errors.lastName && <p className='text-red-400'>{errors.lastName.message}</p>}
              </div>

              <div>
                <label htmlFor="product" className="block text-sm font-semibold text-gray-900">
                  Product Interested in
                </label>
                <div className="mt-2.5">
                  <input
                    id="product"
                    name="product"
                    type="text"
                    placeholder="e.g., minoxidil, Rogaine,"
                    {...register('product',{required :'This field is required'})}
                    className="block w-full rounded-md border border-gray-300 px-3.5 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                 {errors.product && <p className='text-red-400'>{errors.product.message}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-900">
                  Phone Number
                </label>
                <div className="mt-2.5">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+254..."
                    {...register('phoneNumber',{required:'This field is required'})}
                    className="block w-full rounded-md border border-gray-300 px-3.5 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                 {errors.phoneNumber && <p className='text-red-400'>{errors.phoneNumber.message}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                  Email Address
                </label>
                <div className="mt-2.5">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="janedoe@gmail.com"
                    {...register('email',{required:'This field is required'})}
                    className="block w-full rounded-md border border-gray-300 px-3.5 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                 {errors.email && <p className='text-red-400'>{errors.email.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="message" className="block text-sm font-semibold text-gray-900">
                  Message
                </label>
                <div className="mt-2.5">
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Inquire about the product you’re looking for..."
                    {...register('message',{required :'This field is required'})}
                    className="block w-full rounded-md border border-gray-300 px-3.5 py-2 text-base text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    defaultValue={''}
                  />
                </div>
                 {errors.message && <p className='text-red-400'>{errors.message.message}</p>}
              </div>
            </div>

            <div className="mt-10">
              <button
                type="submit"
                className="block w-full rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Enquire-let's talk
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              By submitting this form, you agree to our{' '}
              <a href="#" className="font-semibold text-blue-600">
                privacy policy
              </a>
              .
            </p>
          </form>

        
          <div className="lg:mt-6 lg:w-80 lg:flex-none">
            
            <figure className="mt-10">
              <blockquote className="text-lg font-semibold text-gray-900">
                <p>
                  “I walked into the shop feeling hopeless about my thinning hair. Three months later, I can’t believe
                  how full and healthy my hair looks! Highly recommend their rosemary treatment.”
                </p>
              </blockquote>
              <figcaption className="mt-10 flex gap-x-6">
                <img
                  alt="Happy customer"
                  src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=96&h=96&q=80"
                  className="size-12 flex-none rounded-full bg-gray-100"
                />
                <div>
                  <div className="text-base font-semibold text-gray-900">Grace M.</div>
                  <div className="text-sm text-gray-600">Happy Client</div>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </div>
  )
}
