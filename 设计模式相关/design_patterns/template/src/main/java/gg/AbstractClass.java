package gg;

public abstract class AbstractClass {
    final void templateMethod() {
        primitiveOperation1();
        primiriveOperation2();
        concreteOperation();
        hook();
    }

    abstract void primitiveOperation1();
    abstract void primiriveOperation2();

    final void concreteOperation() {

    }

    void hook() {

    }
}
