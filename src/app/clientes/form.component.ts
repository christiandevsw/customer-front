import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { Region } from './Region';


@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  cliente: Cliente = new Cliente();
  regiones:Region[];
  titulo: string = 'Crear Cliente';
  errores: string[];

  constructor(private clienteService: ClienteService, private router: Router,
    private activatedRoute: ActivatedRoute) { }


  ngOnInit(): void {
    this.cargaCliente();
  }

  cargaCliente(): void {
    // this.activatedRoute.params.subscribe(params => {
    this.activatedRoute.paramMap.subscribe(params => {
      // let id = params['id'];
      let id = +params.get('id');
      if (id) {
        this.clienteService.getCliente(id).subscribe(cliente => this.cliente = cliente)
      }
    });
    this.clienteService.getRegiones().subscribe(regiones=>this.regiones=regiones);
  }

  create(): void {
    console.log(this.cliente);
    this.clienteService.create(this.cliente).subscribe({
      next: cliente => {
        this.router.navigate(['/clientes'])
        Swal.fire('Nuevo Cliente', `Cliente ${cliente.nombre} creado con exito!`, 'success');
      },
      error: err => {
        this.errores = err.error.errors as string[];
        console.error('Codigo del error desde el backend: ' + err.status);
        console.error(err.error.errors);
      }
    });
  }

  update(): void {
    console.log(this.cliente);
    this.clienteService.update(this.cliente).subscribe({
      next: json => {
        this.router.navigate(['/clientes'])
        Swal.fire('Cliente Actualizado', `${json.mensaje}: ${json.cliente.nombre}`, 'success');
      },
      error: err => {
        this.errores = err.error.errors as string[];
        console.error('Codigo del error desde el backend: ' + err.status);
        console.error(err.error.errors);
      }
    })
  }

  compararRegion(o1:Region,o2:Region):boolean{
    if(o1===undefined && o2===undefined){
      return true;
    }
    return o1===null || o2===null || o1===undefined || o2===undefined ? false: o1.id===o2.id;
  }

}
