import { Injectable } from '@angular/core';
import { catchError, map, of, tap, throwError } from 'rxjs';
import { Observable } from 'rxjs';
import { Cliente } from './cliente';
// import { CLIENTES } from './clientes.json';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { formatDate, DatePipe } from '@angular/common';
import { Region } from './Region';
import { AuthService } from '../usuarios/auth.service';



@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private urlEndPoint: string = 'http://localhost:8080/api/clientes';
  private httpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient, private router: Router,private authService:AuthService) { }

  //este metodo lo vamos a lalmar en cada llamada a los endpoints, peticion hacia las rutas protegidas
  private agregarAuthorizationHeader(){
    let token=this.authService.token;
    if (token!=null) {
      return this.httpHeaders.append('Authorization','Bearer '+token);
    }
    return this.httpHeaders;
  }


  private isNoAutorizado(e):boolean{
    if (e.status==401) {

      //cuando el  token expira desde el backend
      if(this.authService.isAuthenticated()){
        this.authService.logout();
      }

      this.router.navigate(['/login']);
      return true;
    }

    if (e.status==403) {
      Swal.fire('Acceso denegado',`Hola ${this.authService.usuario.username} no tienes acceso a este recurso`,'warning');
      this.router.navigate(['/clientes']);
      return true;
    }
    return false;
  }


  getRegiones():Observable<Region[]>{
    return this.http.get<Region[]>(this.urlEndPoint+'/regiones',{headers:this.agregarAuthorizationHeader()}).pipe(
      catchError(e=>{
        this.isNoAutorizado(e);
        return throwError(()=>e)
      })
    );
  }


  // es un metodo sincrono y no podria funcionar bien en un contexto real
  // getClientes():  Cliente[]{
  //   return CLIENTES;
  // }

  // getClientes(): Observable<Cliente[]> {
  // return of(CLIENTES); 
  //formas equivalente
  // return this.http.get<Cliente[]>(this.urlEndPoint);
  // return this.http.get(this.urlEndPoint).pipe( map(response => response as Cliente[]))

  //dado q el json del paginado tiene estructura muy arbitraria con atrr: content, Cliente[] -> any
  getClientes(page: number): Observable<any> {
    return this.http.get(this.urlEndPoint + '/page/' + page).pipe(
      tap((response: any) => {
        console.log('ClienteService tap 1');
        (response.content as Cliente[]).forEach(cliente => console.log(cliente.nombre)

        )
      }),
      map((response: any) => {
        (response.content as Cliente[]).map(cliente => {
          cliente.nombre = cliente.nombre.toUpperCase();

          // cliente.createAt=formatDate(cliente.createAt,'dd-MM-yyyy','en-US')
          let datePipe = new DatePipe('es');
          // let datePipe=new DatePipe('en-US');
          // cliente.createAt=datePipe.transform(cliente.createAt,'dd/MM/yyyy');
          //cliente.createAt=datePipe.transform(cliente.createAt,'EEEE dd, MMMM yyyy');
          // cliente.createAt=datePipe.transform(cliente.createAt,'fullDate');
          return cliente;
        })
        return response;
      }),
      tap(response => {
        console.log('ClienteService: tap 2');
        (response.content as Cliente[]).forEach(cliente => console.log(cliente.nombre)

        )
      })
    );

  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post(this.urlEndPoint, cliente, { headers: this.agregarAuthorizationHeader() }).pipe(
      map((response: any) => response.cliente as Cliente),
      catchError(e => {

        if(this.isNoAutorizado(e)){
          return throwError(()=>e);
        }


        if (e.status == 400) {
          return throwError(() => e)
        }
        console.error(e.error.mensaje)
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(() => e);
      })
    );
  }

  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`,{ headers: this.agregarAuthorizationHeader() }).pipe(
      catchError(e => {

        if(this.isNoAutorizado(e)){
          return throwError(()=>e);
        }

        this.router.navigate(['/clientes'])
        console.error(e.error.mensaje);
        Swal.fire('Error al editar', e.error.mensaje, 'error');
        return throwError(() => e);
      })
    );
  }

  update(cliente: Cliente): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint}/${cliente.id}`, cliente, { headers: this.agregarAuthorizationHeader()  }).pipe(
      catchError(e => {

        if(this.isNoAutorizado(e)){
          return throwError(()=>e);
        }

        if (e.status == 400) {
          return throwError(() => e)
        }

        console.error(e.error.mensaje)
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(() => e);
      })
    );
  }
  delete(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`, { headers: this.agregarAuthorizationHeader()  }).pipe(
      catchError(e => {

        if(this.isNoAutorizado(e)){
          return throwError(()=>e);
        }

        console.error(e.error.mensaje)
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(() => e);
      })
    );
    //return;
  }


  //escoger foto 
  subirFoto(archivo: File, id): Observable<HttpEvent<{}>> {
    let formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id", id);

    let httpHeaders= new HttpHeaders();
    let token=this.authService.token;

    if(token!=null){
      httpHeaders=httpHeaders.append('Authorization','Bearer '+token);
    }

    /* 
    subirFoto(archivo: File, id): Observable<Cliente> {
        let formData = new FormData();
        formData.append("archivo", archivo);
        formData.append("id", id);
    
        return this.http.post(`${this.urlEndPoint}/upload`, formData).pipe(
           map((response: any) => response.cliente as Cliente),
           catchError(e => {
             console.error(e.error.mensaje)
             Swal.fire(e.error.mensaje, e.error.error, 'error');
             return throwError(() => e);
           })
    
         ); 
          }
         */


    const req = new HttpRequest('POST', `${this.urlEndPoint}/upload`, formData, {
      reportProgress: true,
      headers:httpHeaders
    });

    //.pipe ya no va en vez de retornar un Observable<Cliente>, va a retornar un HttpEvent con el progreso
    return this.http.request(req).pipe(
      catchError(e=>{
        this.isNoAutorizado(e);
        return throwError(()=>e)
      })
    );

  }


}
