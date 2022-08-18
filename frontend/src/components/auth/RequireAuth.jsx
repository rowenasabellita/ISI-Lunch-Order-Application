import { useLocation, Navigate } from "react-router-dom";

export const setToken = (token)=>{
  localStorage.setItem('temporary', token)
}

export const fetchToken = (token)=>{
  return localStorage.getItem('temporary')
}

export function RequireToken({children}){
  let auth = fetchToken()
  let location = useLocation()
  if(!auth){
      return <Navigate to='/' state ={{from : location}}/>;
  }
  return children;
}

export const setAdmin = (admin)=>{
  localStorage.setItem('admin', admin)
}

export const fetchAdmin = (admin)=>{
  return localStorage.getItem('admin')
}

export function RequireAdmin({children}){
  let auth = fetchAdmin()
  let location = useLocation()
  if(!auth){
      return <Navigate to='/homepage' state ={{from : location}}/>;
  }
  return children;
}