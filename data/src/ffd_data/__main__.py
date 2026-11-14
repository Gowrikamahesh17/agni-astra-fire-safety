from ffd_data import examples, export


def main():
    from ml import export_model

    export.main()
    export_model.main()
    examples.main()


if __name__ == "__main__":
    main()
