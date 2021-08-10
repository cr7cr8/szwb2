import axios from 'axios'



let url = ""

if (process.env.NODE_ENV === "development") {

    // url="http://localhost/api"
    url = "http://192.168.0.100/api"
}
else {
    url = "/api"

}

axios.interceptors.request.use(
    function fn1(request) {

        
        axios.defaults.headers.common['x-auth-token'] = localStorage.getItem("token")
      //  console.log(request)
        return request
    }

)


// if (getToken()) { axios.defaults.headers.common['x-auth-token'] = getToken() }


// function getToken() {

//     return localStorage.getItem("token")
// }





export { axios };
export default url;