import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';
import { DOMParser } from 'xmldom';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private productos: Producto[] = [];

  constructor() {
    this.cargarProductos();
  }

  obtenerProductos(): Producto[] {
    return this.productos;
  }

  agregarProducto(producto: Producto): void {
    producto.id = this.obtenerSiguienteId();
    this.productos.push(producto);
    this.guardarProductos();
  }

  actualizarProducto(index: number, producto: Producto): void {
    this.productos[index] = producto;
    this.guardarProductos();
  }

  actualizarProductoCantidad(id: number, cantidad: number): void {
    const producto = this.productos.find(p => p.id === id);
    if (producto) {
      producto.cantidad = cantidad;
      this.guardarProductos();
    }
  }

  obtenerProductoCantidad(id: number): number {
    const producto = this.productos.find(p => p.id === id);
    return producto ? producto.cantidad ?? 0 : 0;
  }

  eliminarProducto(index: number): void {
    this.productos.splice(index, 1);
    this.guardarProductos();
  }

  saveFile(file: File, filePath: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        localStorage.setItem(filePath, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  }

  deleteFile(filePath: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(filePath);
    }
  }

  private guardarProductos(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const productosXML = this.convertirProductosAXML(this.productos);
      localStorage.setItem('productos', productosXML);
    }
  }

  private convertirProductosAXML(productos: Producto[]): string {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<productos>\n`;
    productos.forEach(producto => {
      xml += `  <producto id="${producto.id}">\n`;
      xml += `    <nombre>${producto.nombre}</nombre>\n`;
      xml += `    <precio>${producto.precio}</precio>\n`;
      xml += `    <cantidad>${producto.cantidad}</cantidad>\n`;
      xml += `    <imagen>${producto.imagen}</imagen>\n`;
      xml += `  </producto>\n`;
    });
    xml += `</productos>`;
    return xml;
  }

  private cargarProductos(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const productosXML = localStorage.getItem('productos');
      if (productosXML) {
        this.productos = this.parsearProductosDesdeXML(productosXML);
      } else {
        this.cargarProductosPorDefecto();
      }
    } else {
      this.cargarProductosPorDefecto();
    }
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
      const nombreNode = productoNode.getElementsByTagName('nombre')[0];
      const precioNode = productoNode.getElementsByTagName('precio')[0];
      const cantidadNode = productoNode.getElementsByTagName('cantidad')[0];
      const imagenNode = productoNode.getElementsByTagName('imagen')[0];

      const nombre = nombreNode ? nombreNode.textContent || '' : '';
      const precio = precioNode ? Number(precioNode.textContent) : undefined;
      const cantidad = cantidadNode ? Number(cantidadNode.textContent) : undefined;
      const imagen = imagenNode ? imagenNode.textContent || '' : '';

      productos.push(new Producto(id, nombre, cantidad, precio, imagen));
    }
    return productos;
  }

  private obtenerSiguienteId(): number {
    const ids = this.productos.map(producto => producto.id);
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }
}