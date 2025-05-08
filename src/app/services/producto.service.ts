import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private productos: Producto[] = [];

  constructor() {
    this.cargarProductosPorDefecto();
  }

  obtenerProducto(): Producto[] {
    return this.productos;
  }

  private cargarProductosPorDefecto(): void {
    const productosXML = `
      <?xml version="1.0" encoding="UTF-8"?>
      <productos>
        <producto id="1">
          <nombre>New York Yankees Negro 59FIFTY New Era Cap</nombre>
          <precio>899</precio>
          <cantidad>10</cantidad>
          <imagen>assets/gorra1.jpg</imagen>
        </producto>
        <producto id="2">
          <nombre>New York Yankees Verde 59FIFTY New Era Cap</nombre>
          <precio>899</precio>
          <cantidad>15</cantidad>
          <imagen>assets/gorra2.webp</imagen>
        </producto>
        <producto id="3">
          <nombre>Gorra New Era Green Pink</nombre>
          <precio>899</precio>
          <cantidad>8</cantidad>
          <imagen>assets/gorra3.webp</imagen>
        </producto>
        <producto id="4">
          <nombre>Gorra Goorin Bros Gallo</nombre>
          <precio>899</precio>
          <cantidad>12</cantidad>
          <imagen>assets/gorra4.webp</imagen>
        </producto>
        <producto id="5">
          <nombre>Gorra Goorin Bros Vaca</nombre>
          <precio>899</precio>
          <cantidad>20</cantidad>
          <imagen>assets/gorra5.jpg</imagen>
        </producto>
        <producto id="6">
          <nombre>Gorra Goorin Bros Pantera</nombre>
          <precio>899</precio>
          <cantidad>5</cantidad>
          <imagen>assets/gorra6.jpg</imagen>
        </producto>
      </productos>
    `;
    this.productos = this.parsearProductosDesdeXML(productosXML);
  }

  private parsearProductosDesdeXML(xml: string): Producto[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'application/xml');
    const productos: Producto[] = [];
    const productosNodes = xmlDoc.getElementsByTagName('producto');
    for (let i = 0; i < productosNodes.length; i++) {
      const productoNode = productosNodes[i];
      const id = Number(productoNode.getAttribute('id'));
      const nombre = productoNode.getElementsByTagName('nombre')[0].textContent || '';
      const precio = Number(productoNode.getElementsByTagName('precio')[0].textContent);
      const imagen = productoNode.getElementsByTagName('imagen')[0].textContent || '';
      productos.push(new Producto(id, nombre, precio, imagen));
    }
    return productos;
  }
}