import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from './auth.service';
import { Usuario } from './usuario';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  titulo: string = "Por favor  Sign In!";
  usuario: Usuario;

  constructor(private authService: AuthService, private router: Router) {
    this.usuario = new Usuario();
  }

  ngOnInit(): void {
    if(this.authService.isAuthenticated()){
      Swal.fire('Login', `Hola ${this.authService.usuario.username} ya estas autenticado!`, 'info');
      this.router.navigate(['/clientes']);
    }
  }

  login(): void {
    console.log(this.usuario);

    if (this.usuario.username == null || this.usuario.password == null) {
      Swal.fire('Error login', 'Username o password vacias!', 'error');
      return;
    }

    this.authService.login(this.usuario).subscribe({
      next: response => {
        console.log(response);
        //para acceder al user_name o username(como sea), hay q decodificar ya q esta en base 64
        // let payload=JSON.parse(atob( response.access_token.split(".")[1]));
        // console.log(payload);

        this.authService.guardarUsuario(response.access_token);
        this.authService.guardarToken(response.access_token);
        let usuario = this.authService.usuario;

        this.router.navigate(['/clientes']);
        //username esta separado con _ , ver jwt.io
        // Swal.fire('Login',`Hola ${payload.user_name}, has iniciado sesion con exito!`,'success');
        Swal.fire('Login', `Hola ${usuario.username}, has iniciado sesion con exito!`, 'success');
      },
      error: err => {
        if(err.status==400){
          Swal.fire('Error login', 'Usuario o clave incorrectas!', 'error');
        }
      }
    });
  }


}
