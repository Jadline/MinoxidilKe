import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'

import {GoogleOAuthProvider} from '@react-oauth/google'
import {Toaster} from 'react-hot-toast'

const queryclient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <QueryClientProvider client={queryclient}>
      <GoogleOAuthProvider clientId='797864837841-vnmio34306k8gh8o9sfn0mdqfffs00c5.apps.googleusercontent.com'>
         <App />
      </GoogleOAuthProvider>
   </QueryClientProvider>
    <Toaster 
    position='top-center'
    gutter ={12}
    containerStyle={{margin : '8px'}}
    toastOptions={{
        success : {
            duration : 3000
        },
        Error : {
            duration : 5000
        },
        style : {
            fontSize : '16px',
            backgroundColor :'#fff',
            color : '#000',
            maxWidth : '50rem',
            padding : '1.6rem 2.4rem'

        }
    }
    }

    />
  </StrictMode>,
)
