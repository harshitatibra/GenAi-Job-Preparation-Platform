import React,{useState} from 'react'
import '../auth.form.scss'
import {Link} from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import {useNavigate} from "react-router-dom";

const Login = () => {

    const{loading, handleLogin} = useAuth()
    const navigate = useNavigate();

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleLogin({email, password})
        navigate("/")
        // Handle login logic here
    }

    if(loading){
        return(
            <main><h1>Loading...</h1></main>
        )
    }

  return (
    <main>
        <div className="form-container">
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>

                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input 
                    onChange={(e)=>{setEmail(e.target.value)}}
                    type="email" name="email" id="email" placeholder='Enter your email' />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input 
                    onChange={(e)=>{setPassword(e.target.value)}}
                    type="password" name="password" id="password" placeholder='Enter your password' />
                </div>

                <button className="button primary-button">Login</button>

            </form>

            <p>Don't have an account? <Link to="/register" className="button-link">Register</Link></p>
        </div>
    </main>
  )
}

export default Login