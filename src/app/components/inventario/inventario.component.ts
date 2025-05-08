import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { InventarioService } from '../../services/inventario.service';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  productos: Producto[] = [];
  nuevoProducto: Producto = new Producto(0, '', undefined, undefined, ''); // Initialize precio and cantidad as undefined
  productoSeleccionado: Producto = new Producto(0, '', undefined, undefined, ''); // Initialize precio and cantidad as undefined
  productoIndex: number = -1;
  mostrarModal: boolean = false;
  selectedFile: File | null = null;
  mensajeExito: string | null = null;
  mensajeError: string | null = null;

  constructor(private inventarioService: InventarioService, private router: Router) {}

  ngOnInit(): void {
    this.productos = this.inventarioService.obtenerProductos();
    this.cargarImagenes();
  }

  onFileSelected(event: Event, isUpdate: boolean = false): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (isUpdate) {
          this.productoSeleccionado.imagen = reader.result as string;
        } else {
          this.nuevoProducto.imagen = reader.result as string;
        }
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  agregarProducto(): void {
    if (!this.nuevoProducto.nombre || this.nuevoProducto.cantidad === undefined || !this.selectedFile) {
      this.mostrarMensajeError('Todos los campos son obligatorios!');
      return;
    }
    if (this.nuevoProducto.precio !== undefined && isNaN(Number(this.nuevoProducto.precio))) {
      this.mostrarMensajeError('El precio debe ser un número válido!');
      return;
    }
    if (this.nuevoProducto.cantidad !== undefined && isNaN(Number(this.nuevoProducto.cantidad))) {
      this.mostrarMensajeError('La cantidad debe ser un número válido!');
      return;
    }
    if (this.selectedFile) {
      const filePath = `assets/${this.selectedFile.name}`;
      this.nuevoProducto.imagen = filePath;
      this.inventarioService.saveFile(this.selectedFile, filePath);
    }
    this.nuevoProducto.precio = this.nuevoProducto.precio !== undefined ? Number(this.nuevoProducto.precio) : undefined; // Convert precio to number if defined
    this.nuevoProducto.cantidad = this.nuevoProducto.cantidad !== undefined ? Number(this.nuevoProducto.cantidad) : 0; // Convert cantidad to number if defined, default to 0
    this.inventarioService.agregarProducto(this.nuevoProducto);
    this.cargarImagenes(); // Cargar las imágenes desde el localStorage
    this.nuevoProducto = new Producto(0, '', undefined, undefined, ''); // Reset precio and cantidad to undefined
    this.selectedFile = null;
    this.mostrarMensajeExito('Producto agregado con éxito!');
  }

  abrirModal(producto: Producto, index: number): void {
    this.productoSeleccionado = { ...producto };
    this.productoSeleccionado.precio = this.productoSeleccionado.precio !== undefined ? Number(this.productoSeleccionado.precio) : undefined; // Ensure precio is a number if defined
    this.productoSeleccionado.cantidad = this.productoSeleccionado.cantidad !== undefined ? Number(this.productoSeleccionado.cantidad) : undefined; // Ensure cantidad is a number if defined
    this.productoIndex = index;
    this.mostrarModal = true;
    document.body.style.overflow = 'hidden'; // Disable scroll
  }

  cerrarModal(event?: MouseEvent): void {
    if (event) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('modal')) {
        this.mostrarModal = false;
        document.body.style.overflow = 'auto'; // Enable scroll
      }
    } else {
      this.mostrarModal = false;
      document.body.style.overflow = 'auto'; // Enable scroll
    }
  }

  actualizarProducto(): void {
    if (!this.productoSeleccionado.nombre || this.productoSeleccionado.cantidad === undefined) {
      this.mostrarMensajeError('Todos los campos son obligatorios!');
      return;
    }
    if (this.productoSeleccionado.precio !== undefined && isNaN(Number(this.productoSeleccionado.precio))) {
      this.mostrarMensajeError('El precio debe ser un número válido!');
      return;
    }
    if (this.productoSeleccionado.cantidad !== undefined && isNaN(Number(this.productoSeleccionado.cantidad))) {
      this.mostrarMensajeError('La cantidad debe ser un número válido!');
      return;
    }
    if (this.selectedFile) {
      const oldFilePath = this.productos[this.productoIndex].imagen;
      const newFilePath = `assets/${this.selectedFile.name}`;
      this.productoSeleccionado.imagen = newFilePath;
      this.inventarioService.saveFile(this.selectedFile, newFilePath);
      this.inventarioService.deleteFile(oldFilePath);
    }
    this.productoSeleccionado.precio = this.productoSeleccionado.precio !== undefined ? Number(this.productoSeleccionado.precio) : undefined; // Convert precio to number if defined
    this.productoSeleccionado.cantidad = this.productoSeleccionado.cantidad !== undefined ? Number(this.productoSeleccionado.cantidad) : 0; // Convert cantidad to number if defined, default to 0
    this.inventarioService.actualizarProducto(this.productoIndex, this.productoSeleccionado);
    this.productos[this.productoIndex] = { ...this.productoSeleccionado };
    this.cargarImagenes(); // Cargar las imágenes desde el localStorage
    this.cerrarModal();
    this.selectedFile = null;
    this.mostrarMensajeExito('Producto actualizado con éxito!');
  }

  eliminarProducto(index: number): void {
    const filePath = this.productos[index].imagen;
    this.inventarioService.deleteFile(filePath);
    this.inventarioService.eliminarProducto(index);
    this.productos.splice(index, 1);
    this.mostrarMensajeExito('Producto eliminado con éxito!');
  }

  irAProductos(): void {
    this.router.navigate(['/productos']);
  }

  private mostrarMensajeExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    setTimeout(() => {
      this.mensajeExito = null;
    }, 3000);
  }

  private mostrarMensajeError(mensaje: string): void {
    this.mensajeError = mensaje;
    setTimeout(() => {
      this.mensajeError = null;
    }, 3000);
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

  validarNumero(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9.]/g, '');
  }
}