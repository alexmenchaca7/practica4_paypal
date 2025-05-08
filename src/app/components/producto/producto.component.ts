import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { Producto } from '../../models/producto'; 
import { InventarioService } from '../../services/inventario.service';
import { CarritoService } from '../../services/carrito.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  productos: Producto[] = [];
  mensajeExito: boolean = false;
  mensajeError: string | null = null;

  constructor(
    private inventarioService: InventarioService,
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productos = this.inventarioService.obtenerProductos();
    this.cargarImagenes();
  }

  agregarAlCarrito(producto: Producto): void {
    if (producto.cantidad && producto.cantidad > 0) {
      this.carritoService.agregarProducto(producto);
      this.mensajeExito = true;
      setTimeout(() => {
        this.mensajeExito = false;
      }, 3000);
    } else {
      this.mensajeError = 'Producto agotado!';
      setTimeout(() => {
        this.mensajeError = null;
      }, 3000);
    }
  }

  irAlCarrito(): void {
    this.router.navigate(['/carrito']);
  }

  irAlInventario(): void {
    this.router.navigate(['/inventario']);
  }

  private cargarImagenes(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.productos.forEach(producto => {
        const dataUrl = localStorage.getItem(producto.imagen);
        if (dataUrl) {
          producto.imagen = dataUrl;
        }
      });
    }
  }
}