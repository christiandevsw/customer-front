import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/usuarios/auth.service';
import Swal from 'sweetalert2';
import { Cliente } from '../cliente';
import { ClienteService } from '../cliente.service';
import { ModalService } from './modal.service';


@Component({
  selector: 'detalle-cliente',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css']
})
export class DetalleComponent implements OnInit {
  //@Input() dado q usaremos un modal
  @Input() cliente: Cliente;
  titulo: string = 'Detalle del cliente';
  fotoSeleccionada: File;
  progreso: number = 0;

  constructor(private clienteService: ClienteService, public authService:AuthService,private activatedRoute: ActivatedRoute,
    public modalService: ModalService) { }


  ngOnInit(): void {

    /*
        //ya no es necesario dado q usasremos modal
        //a traves de este evento ngOnInit, vamos a suscribir  cuando cambia el parametro del id para obtener el detalle cliente
        this.activatedRoute.paramMap.subscribe(params => {
          let id: number = +params.get('id');
          if (id) {
            this.clienteService.getCliente(id).subscribe(cliente => this.cliente = cliente);
          }
        });
    
    */


  }


  seleccionarFoto(event: any) {
    //event.target.files[0]: la unica foto q estamos subiendo(ya q una subida es de 1 en 1)
    this.fotoSeleccionada = event.target.files[0]; //parece q esta lineA basta para escoger foto
    //// lo nuevo 
    this.progreso = 0;
    ////
    console.log(this.fotoSeleccionada);
    if (this.fotoSeleccionada.type.indexOf('image') < 0) {
      Swal.fire('Error seleccionar imagen: ', 'El archivo debe ser del tipo imagen', 'error');
      this.fotoSeleccionada = null;
    }
  }

  // subirFoto() {
  //   if (!this.fotoSeleccionada) {
  //     Swal.fire('Error Upload: ','Debe seleccionar una foto','error');
  //   }else{
  //     this.clienteService.subirFoto(this.fotoSeleccionada, this.cliente.id).subscribe(cliente => {
  //       this.cliente = cliente;
  //       Swal.fire('La foto se ha subido completamente!', `La foto se ha subido com exito: ${this.cliente.foto}`, 'success');
  //     });
  //   }
  // }

  subirFoto() {
    if (!this.fotoSeleccionada) {
      Swal.fire('Error Upload: ', 'Debe seleccionar una foto', 'error');
    } else {
      this.clienteService.subirFoto(this.fotoSeleccionada, this.cliente.id)
        //maneja un event ya no un cliente
        .subscribe(event => {
          // this.cliente = cliente;
          if (event.type === HttpEventType.UploadProgress) {
            this.progreso = Math.round((event.loaded / event.total) * 100);
          } else if (event.type === HttpEventType.Response) {
            let response: any = event.body;
            this.cliente = response.cliente as Cliente;

            this.modalService.notificarUpload.emit(this.cliente)
            Swal.fire('La foto se ha subido completamente!', response.mensaje, 'success');
          }

        });
    }

  }

  cerrarModal(){
    this.modalService.cerrarModal();
    this.fotoSeleccionada=null;
    this.progreso=0;
  }


}
