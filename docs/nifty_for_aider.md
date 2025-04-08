
#Nifty Framework Documentation

##Directory Structure
- client/ -- all client side code
    - alwaysload/ -- all files here are bundled with main.ts into main.js and thus included in primary load of app 
    - thirdparty/ -- all external libraries like chartist and lithtml. NOT loaded by default 
    - lazy/ -- any app code that is NOT loaded by default, aka: lazy loaded.
        - components/ -- any component that is meant to be included within a view
        - views/ -- any view (corresponding to a URL endpoint, aka: 'machines/12345/statuses')
        - libs/ -- any file with helper functions meant to be included with a component or view
        - components/componentexample/ -- a particular component e.g. customdropdown. 
            - contains an html, css and typescript file, that all get bundled as one in build process
        - views/viewexample/ -- a particular view e.g. machines.
            - contains an html, css and typescript file, that all get bundled as one in build process
            - may contain a parts folder that are sub components that are particular to this view

- server -- all server side code

##Component System
- Nifty is designed to run on Raw Web Components with litHTML rendering to model and state to DOM 
- Each view or component typescript file (e.g. lazy/views/machines/machines.ts or lazy/components/customdropdown/customdropdown.ts) should be a module containing:  
    - A Raw Web Component, e.g. class VMachines extends HTMLElement.
    - a ModelT, StateT and AttributeT typescript type.
        - Model is any data from server this view/component needs, e.g. list of machines. Should be assigned in kd function and thereafter not changed
        - State is any changing state properties, but only local to component
        - Attributes is any properties on html element tag and might be changed
    - connectedCallback, attributeChangedCallback, and disconnectedCallback standard Web Component functions
    - kd function: (knitdata) load model data into component and setup component on initial data load as well as on data change
    - sc function: (state changed). called to render to DOM whenever state changes or initially when model is loaded 
    - template function: to pass on state and model data over to litHTML templating system
- Each view or component is compiled at build time from separate html, css and typescript files. 
    - HTML is not in typescript file, but in html file and bundled back to javascript file in build process
- Each view or component has acces to CMech library (ComponentMechanics). CMech has:
    - ViewConnectedCallback or ViewPartConnectedCallback. This handles boilerplate for initializing a component in the nifty framework
    - AttributeChangedCallback. Coalesces multiple attribute changes into one event and updates 'a' component property (for attribute properties)
    - disconnectedCallback. Standard clean up within nifty framework
- Each view or component's kd function is automatically called from CMech on first initilization and model data updates.
- Each view or component does NOT handle loading model data. Its given access to what data it needs from within kd function
