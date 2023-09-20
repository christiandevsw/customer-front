import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '../usuarios/auth.service';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { ModalService } from './detalle/modal.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html'
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[];
  paginador: any;
  clienteSeleccionado: Cliente;

  constructor(private clienteService: ClienteService,public authService:AuthService, 
    private activatedRoute: ActivatedRoute, private modalService: ModalService) { }

  // ngOnInit(): void {
  //   this.clienteService.getClientes().pipe(
  //     tap(clientes => this.clientes = clientes)
  //   )
  //     // .subscribe( clientes=>this.clientes=clientes);
  //     .subscribe();
  // }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      let page: number = +params.get('page');

      if (!page) {
        page = 0;
      }

      this.clienteService.getClientes(page).pipe(
        tap(response => {
          console.log('ClientesComponen: tap 3');
          (response.content as Cliente[]).forEach(cliente => console.log(cliente.nombre));
        })
      ).subscribe(response => {
        this.clientes = response.content as Cliente[];
        this.paginador = response;
      });
    });

    this.modalService.notificarUpload.subscribe(cliente=>{
      this.clientes=this.clientes.map(clienteOriginal =>{
        if (clienteOriginal.id==cliente.id) {
          clienteOriginal.foto=cliente.foto;
        }
        return clienteOriginal;
      });
    })
  }

  delete(cliente: Cliente): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.clienteService.delete(cliente.id).subscribe(
          response => {
            this.clientes = this.clientes.filter(cli => cli !== cliente) //seria mejor comparacion x id
            Swal.fire('Cliente Eliminado!', `Cliente ${cliente.nombre} eliminado con exito`, 'success')
          }
        )
      }
    })
  }


  abrirModal(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
    this.modalService.abrirModal();
  }


}
