export default class Util {
  /**
   * Returns true if x is between a and b, false otherwise. If inclusive is
   * true, also returns true if x equals a or b.
   */
  static between(x, a, b, inclusive) {
    let greater = Math.max(a, b);
    let lesser = Math.min(a, b);
    return inclusive ? x >= lesser && x <= greater : x > lesser && x < greater;
  }

  static lerp(a, b, c) {
    return a + c * (b - a);
  }

  static overload(that, argumentz, implementations) {
    argumentz = [...argumentz];

    const SPECIAL_TYPES = {
      number: Number,
      string: String,
    };

    implementations: for (const implementation of implementations) {
      if (implementation.signature.length !== argumentz.length) {
        continue;
      }
      for (let i = 0; i < argumentz.length; ++i) {
        const argument = argumentz[i];
        const tipe = implementation.signature[i];
        // TODO(maxrad, rain): Add keyword support (where the type value in the
        // signature is the string "any" or "varargs", perhaps?) for wildcard
        // and variadic overloads.
        const tipeof = typeof argument;
        if (SPECIAL_TYPES.hasOwnProperty(tipeof)) {
          // Special case handling
          if (SPECIAL_TYPES[tipeof] !== tipe) {
            continue implementations;
          }
        } else if (!(argument instanceof tipe)) {
          continue implementations;
        }
      }
      // If we got here, we have found the implementation that matches the
      // arguments passed.
      const impl = implementation.implementation;
      try {
        return impl.apply(that, argumentz);
      } catch (e) {
        e.message = `Error applying ${impl.name} to ${that.name}: ${e.message}`;
        throw e;
      }
    }
    throw new Error(`No matching implementations for call to ${that.name}`);
  }
}
