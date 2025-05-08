import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { Producto } from '../../models/producto'; // Importa la clase Producto

declare var paypal: any; // Declaración para el SDK de PayPal

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit, AfterViewInit {
  private paypalButtonRendered = false;
  carrito: Producto[] = [];
  recibo: string = ''; // Variable para almacenar el recibo

  constructor(private carritoService: CarritoService, private router: Router) {}

  ngOnInit() {
    this.carrito = this.carritoService.obtenerCarrito();
  }

  eliminarProducto(index: number) {
    this.carritoService.eliminarProducto(index);
    this.carrito = this.carritoService.obtenerCarrito(); // Actualizar el carrito después de eliminar un producto
  }

  actualizarCantidad(index: number, cantidad: number) {
    this.carritoService.actualizarCantidad(index, cantidad);
    this.carrito = this.carritoService.obtenerCarrito(); // Actualizar el carrito después de cambiar la cantidad
  }

  generarXML() {
    this.recibo = this.carritoService.generarXML(); // Almacena el recibo generado
  }

  descargarRecibo() {
    const blob = new Blob([this.recibo], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'recibo.xml';
    link.click();
  }

  calcularSubtotal() {
    return this.carrito.reduce((subtotal, producto) => subtotal + (producto.precio ?? 0) * (producto.cantidad ?? 1), 0);
  }

  calcularIVA() {
    const subtotal = this.calcularSubtotal();
    return subtotal * 0.16; // IVA del 16%
  }

  calcularTotal() {
    return this.calcularSubtotal() + this.calcularIVA();
  }

  irAProductos(): void {
    this.router.navigate(['/productos']);
  }

  ngAfterViewInit() {
    this.renderizarPayPal();
  }

  private renderizarPayPal() {
      if (this.carrito.length > 0 && !this.paypalButtonRendered) {
          this.loadPayPalScript();
      }
  }

  private loadPayPalScript() {
    const clientId = 'ARN4q4xSLo9k19e845bV04QIgO1_gELqDi913C7UyJppQdNYZ_Wug1AIkttyJUCBoqwIIhCFlVLyf3KS';
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=MXN`;
    script.addEventListener('load', () => {
      this.renderPayPalButton();
      this.paypalButtonRendered = true;
    });
    document.body.appendChild(script);
  }

  private renderPayPalButton() {
    // Limpia el contenedor primero
    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';

    // Pequeño delay para sincronización
    setTimeout(() => {
      paypal.Buttons({
        style: {
          layout: 'horizontal',
          color: 'gold',
          shape: 'rect'
        },
        createOrder: (data: any, actions: any) => { // Tipado añadido
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: this.calcularTotal().toFixed(2),
                currency_code: 'MXN',
                breakdown: {
                  item_total: {
                    value: this.calcularSubtotal().toFixed(2),
                    currency_code: 'MXN'
                  },
                  tax_total: {
                    value: this.calcularIVA().toFixed(2),
                    currency_code: 'MXN'
                  }
                }
              },
              items: this.carrito.map(item => ({
                name: item.nombre,
                unit_amount: {
                  value: (item.precio ?? 0).toFixed(2), // Usamos coalescencia nula
                  currency_code: 'MXN'
                },
                quantity: (item.cantidad ?? 0).toString(), // Usamos coalescencia nula
                category: 'PHYSICAL_GOODS'
              }))  
            }]
          });
        },
        onApprove: async (data: any, actions: any) => { // Tipado añadido
          try {
            const details = await actions.order.capture();
            this.carritoService.limpiarCarrito();
            this.carrito = [];
            this.router.navigate(['/exito'], {
              state: { detallesPago: details }
            });
          } catch (err: any) { // Tipado añadido
            console.error('Error capturando el pago:', err);
            alert('Error al procesar el pago');
          }
        },
        onError: (err: any) => { // Tipado añadido
          console.error('Error PayPal:', err);
          alert('Error en la transacción');
        }
      }).render('#paypal-button-container').then(() => {
        console.log('Botón visible:', document.getElementById('paypal-button-container')?.innerHTML);
      });
    }, 300);
  }
}