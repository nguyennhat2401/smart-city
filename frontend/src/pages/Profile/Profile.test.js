// src/pages/Profile/Profile.test.js

import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";

import Profile from "./index";

beforeEach(() => {
  localStorage.setItem("token", "fake-token");

  global.alert = jest.fn();

  global.fetch = jest.fn((url, options) => {
    // ===== PROFILE =====
    if (
      url.includes("/auth/profile/") &&
      (!options || options.method === undefined)
    ) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          username: "phat",
          email: "phat@gmail.com",
          first_name: "Nguyen",
          last_name: "Phat",
          phone: "0123456789",
          address: "HCM",
        }),
      });
    }

    // ===== UPDATE PROFILE =====
    if (
      url.includes("/auth/profile/") &&
      options?.method === "PUT"
    ) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: {
            username: "phat",
            email: "new@gmail.com",
          },
        }),
      });
    }

    // ===== GET VEHICLES =====
    if (
      url.includes("/vehicles/") &&
      (!options || options.method === undefined)
    ) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          {
            id: 1,
            plate_number: "59A-12345",
            vehicle_type: "motorbike",
            brand: "Honda",
            color: "Black",
          },
        ],
      });
    }

    // ===== CREATE VEHICLE =====
    if (
      url.includes("/vehicles/create/")
    ) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          message: "success",
        }),
      });
    }

    // ===== DELETE =====
    if (
      url.includes("/delete/")
    ) {
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    }

    return Promise.resolve({
      ok: true,
      json: async () => ({}),
    });
  });

  window.confirm = jest.fn(() => true);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("Profile Component", () => {
  test("render profile title", async () => {
    render(<Profile />);

    expect(
      await screen.findByText(
        /Thông tin cá nhân/
      )
    ).toBeInTheDocument();
  });

  test("render profile info", async () => {
    render(<Profile />);

    expect(
      await screen.findByDisplayValue(
        "phat@gmail.com"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByDisplayValue(
        "0123456789"
      )
    ).toBeInTheDocument();
  });

  test("render username disabled", async () => {
    render(<Profile />);

    const username =
      await screen.findByDisplayValue(
        "phat"
      );

    expect(username).toBeDisabled();
  });

  test("update input value", async () => {
    render(<Profile />);

    const emailInput =
      await screen.findByDisplayValue(
        "phat@gmail.com"
      );

    fireEvent.change(emailInput, {
      target: {
        value: "new@gmail.com",
      },
    });

    expect(emailInput.value).toBe(
      "new@gmail.com"
    );
  });

  test("update profile success", async () => {
    render(<Profile />);

    const updateBtn =
      await screen.findByText(
        "Cập nhật"
      );

    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(
        "Cập nhật thành công"
      );
    });
  });

  test("render vehicle list", async () => {
    render(<Profile />);

    expect(
      await screen.findByText(
        "59A-12345"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Honda/)
    ).toBeInTheDocument();
  });

  test("render add vehicle form", async () => {
    render(<Profile />);

    expect(
      await screen.findByPlaceholderText(
        "Biển số xe"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText("+ Thêm xe")
    ).toBeInTheDocument();
  });

  test("create vehicle success", async () => {
    render(<Profile />);

    const plateInput =
      await screen.findByPlaceholderText(
        "Biển số xe"
      );

    fireEvent.change(plateInput, {
      target: {
        value: "51A-99999",
      },
    });

    const addBtn =
      screen.getByText("+ Thêm xe");

    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(
        "Thêm xe thành công"
      );
    });
  });

  test("alert when plate empty", async () => {
    render(<Profile />);

    const addBtn =
      await screen.findByText(
        "+ Thêm xe"
      );

    fireEvent.click(addBtn);

    expect(alert).toHaveBeenCalledWith(
      "Nhập biển số xe"
    );
  });

  test("delete vehicle", async () => {
    render(<Profile />);

    const deleteBtn =
      await screen.findByText("Xóa");

    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(
        window.confirm
      ).toHaveBeenCalledWith(
        "Xóa xe này?"
      );
    });
  });

  test("do not delete when cancel confirm", async () => {
    window.confirm = jest.fn(
      () => false
    );

    render(<Profile />);

    const deleteBtn =
      await screen.findByText("Xóa");

    fireEvent.click(deleteBtn);

    expect(
      window.confirm
    ).toHaveBeenCalled();
  });

  test("render no vehicle", async () => {
    global.fetch = jest.fn((url) => {
      if (
        url.includes("/auth/profile/")
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            username: "phat",
          }),
        });
      }

      if (
        url.includes("/vehicles/")
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    render(<Profile />);

    expect(
      await screen.findByText(
        "Chưa có xe"
      )
    ).toBeInTheDocument();
  });

  test("show update error", async () => {
    global.fetch = jest.fn(
      (url, options) => {
        if (
          url.includes(
            "/auth/profile/"
          ) &&
          (!options ||
            options.method ===
              undefined)
        ) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              username: "phat",
            }),
          });
        }

        if (
          url.includes(
            "/auth/profile/"
          ) &&
          options?.method === "PUT"
        ) {
          return Promise.resolve({
            ok: false,
            json: async () => ({
              error: "Lỗi cập nhật",
            }),
          });
        }

        if (
          url.includes("/vehicles/")
        ) {
          return Promise.resolve({
            ok: true,
            json: async () => [],
          });
        }

        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      }
    );

    render(<Profile />);

    const updateBtn =
      await screen.findByText(
        "Cập nhật"
      );

    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(
        "Lỗi cập nhật"
      );
    });
  });

  test("show create vehicle error", async () => {
    global.fetch = jest.fn(
      (url, options) => {
        if (
          url.includes(
            "/auth/profile/"
          )
        ) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              username: "phat",
            }),
          });
        }

        if (
          url.includes("/vehicles/") &&
          (!options ||
            options.method ===
              undefined)
        ) {
          return Promise.resolve({
            ok: true,
            json: async () => [],
          });
        }

        if (
          url.includes(
            "/vehicles/create/"
          )
        ) {
          return Promise.resolve({
            ok: false,
            json: async () => ({
              error: "Lỗi thêm xe",
            }),
          });
        }

        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        });
      }
    );

    render(<Profile />);

    const plateInput =
      await screen.findByPlaceholderText(
        "Biển số xe"
      );

    fireEvent.change(plateInput, {
      target: {
        value: "51A-11111",
      },
    });

    fireEvent.click(
      screen.getByText("+ Thêm xe")
    );

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith(
        "Lỗi thêm xe"
      );
    });
  });
});